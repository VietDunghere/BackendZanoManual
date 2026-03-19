import { pool, withTransaction } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { AdminQuestionsRepository } from '../repositories/admin-questions.repository.js';

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeQuestionPayload(payload) {
    const details = [];
    const content = normalizeText(payload.content);
    const options = Array.isArray(payload.options) ? payload.options : null;
    const correctOptionLabel = normalizeText(payload.correctOptionLabel).toUpperCase();

    if (!content) {
        details.push({ field: 'content', issue: 'required' });
    }

    if (!options || options.length < 2) {
        details.push({ field: 'options', issue: 'invalid_array' });
    }

    const optionMap = new Map();
    if (options) {
        for (const item of options) {
            const label = normalizeText(item.label).toUpperCase();
            const optionContent = normalizeText(item.content);

            if (!['A', 'B', 'C', 'D'].includes(label)) {
                details.push({ field: 'options.label', issue: 'invalid_enum' });
                continue;
            }

            if (!optionContent) {
                details.push({ field: `options.${label}`, issue: 'required' });
                continue;
            }

            optionMap.set(label, optionContent);
        }
    }

    for (const requiredLabel of ['A', 'B', 'C', 'D']) {
        if (!optionMap.has(requiredLabel)) {
            details.push({ field: `options.${requiredLabel}`, issue: 'required' });
        }
    }

    if (!['A', 'B', 'C', 'D'].includes(correctOptionLabel)) {
        details.push({ field: 'correctOptionLabel', issue: 'invalid_enum' });
    }

    return {
        details,
        value: {
            content,
            optionA: optionMap.get('A') || null,
            optionB: optionMap.get('B') || null,
            optionC: optionMap.get('C') || null,
            optionD: optionMap.get('D') || null,
            correctOptionLabel,
        },
    };
}

function toQuestionResponse(row) {
    return {
        questionId: row.id,
        examId: row.exam_id,
        content: row.content,
        options: [
            { label: 'A', content: row.option_a },
            { label: 'B', content: row.option_b },
            { label: 'C', content: row.option_c },
            { label: 'D', content: row.option_d },
        ],
        correctOptionLabel: row.correct_option_label,
        orderNo: row.order_no,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class AdminQuestionsService {
    async listQuestions(examId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminQuestionsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const rows = await repository.listQuestionsByExam(examId);
            return rows.map(toQuestionResponse);
        } finally {
            connection.release();
        }
    }

    async createQuestion(examId, payload) {
        const { details, value } = normalizeQuestionPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        return withTransaction(async (connection) => {
            const repository = new AdminQuestionsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const orderNo = await repository.getNextOrderNo(examId);
            const questionId = await repository.createQuestion({ examId, ...value, orderNo });
            const question = await repository.findQuestionById(examId, questionId);
            return toQuestionResponse(question);
        });
    }

    async updateQuestion(examId, questionId, payload) {
        const { details, value } = normalizeQuestionPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminQuestionsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const question = await repository.findQuestionById(examId, questionId);
            if (!question || question.deleted_at) {
                throw new AppError('Question not found', 404, 'NOT_FOUND');
            }

            await repository.updateQuestion(questionId, value);
            const updated = await repository.findQuestionById(examId, questionId);
            return toQuestionResponse(updated);
        } finally {
            connection.release();
        }
    }

    async deleteQuestion(examId, questionId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminQuestionsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const question = await repository.findQuestionById(examId, questionId);
            if (!question || question.deleted_at) {
                throw new AppError('Question not found', 404, 'NOT_FOUND');
            }

            await repository.softDeleteQuestion(questionId);
            return { deleted: true };
        } finally {
            connection.release();
        }
    }

    async importQuestions(examId, payload) {
        const items = Array.isArray(payload.questions) ? payload.questions : [];
        const maxImportItems = 200;

        if (items.length === 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'questions', issue: 'required_array' },
            ]);
        }

        if (items.length > maxImportItems) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'questions', issue: `max_${maxImportItems}` },
            ]);
        }

        let importedCount = 0;
        const errors = [];

        for (let index = 0; index < items.length; index += 1) {
            const { details } = normalizeQuestionPayload(items[index]);
            if (details.length > 0) {
                errors.push({ index, details });
            }
        }

        if (errors.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', errors);
        }

        for (const item of items) {
            await this.createQuestion(examId, item);
            importedCount += 1;
        }

        return {
            importedCount,
            skippedCount: 0,
            message: 'Imported from JSON payload for local MVP',
        };
    }
}
