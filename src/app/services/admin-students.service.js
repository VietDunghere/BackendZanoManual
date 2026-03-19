import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { pool } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { AdminStudentsRepository } from '../repositories/admin-students.repository.js';

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizePagination(query) {
    const rawPage = Number(query.page || 1);
    const rawPageSize = Number(query.pageSize || 10);
    const maxPage = 10_000;

    const pageBase = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const page = Math.min(pageBase, maxPage);
    const pageSizeBase = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;
    const pageSize = Math.min(pageSizeBase, 50);

    return { page, pageSize };
}

function isValidEmail(email) {
    if (!email) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateTemporaryPassword(length = 12) {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i += 1) {
        result += charset[bytes[i] % charset.length];
    }

    return result;
}

function validateStudentPayload(payload) {
    const details = [];
    const username = normalizeText(payload.studentCode || payload.username);
    const fullName = normalizeText(payload.fullName);
    const className = normalizeText(payload.className) || null;
    const email = normalizeText(payload.email) || null;

    if (!username) {
        details.push({ field: 'studentCode', issue: 'required' });
    }

    if (!fullName) {
        details.push({ field: 'fullName', issue: 'required' });
    }

    if (!isValidEmail(email)) {
        details.push({ field: 'email', issue: 'invalid_email' });
    }

    return {
        details,
        value: {
            username,
            fullName,
            className,
            email,
        },
    };
}

function toStudentResponse(student) {
    return {
        studentId: student.id,
        studentCode: student.username,
        fullName: student.full_name,
        className: student.class_name,
        email: student.email,
        isActive: Boolean(student.is_active),
        createdAt: student.created_at,
        updatedAt: student.updated_at,
    };
}

export class AdminStudentsService {
    async listStudents(query) {
        const { page, pageSize } = normalizePagination(query);
        const q = normalizeText(query.q) || null;

        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const { rows, total } = await repository.listStudents({ q, page, pageSize });

            return {
                data: rows.map(toStudentResponse),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
                },
            };
        } finally {
            connection.release();
        }
    }

    async createStudent(payload) {
        const { details, value } = validateStudentPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const existed = await repository.findStudentByUsername(value.username);
            if (existed) {
                throw new AppError('Student code already exists', 409, 'CONFLICT');
            }

            const temporaryPassword = generateTemporaryPassword(12);
            const passwordHash = await bcrypt.hash(temporaryPassword, 10);
            const studentId = await repository.createStudent({ ...value, passwordHash });
            const student = await repository.findStudentById(studentId);
            return {
                ...toStudentResponse(student),
                temporaryPassword,
                mustChangePassword: true,
            };
        } finally {
            connection.release();
        }
    }

    async updateStudent(studentId, payload) {
        const { details, value } = validateStudentPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        const isActive = payload && payload.isActive !== undefined ? Boolean(payload.isActive) : true;

        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const existing = await repository.findStudentById(studentId);
            if (!existing) {
                throw new AppError('Student not found', 404, 'NOT_FOUND');
            }

            const duplicated = await repository.findStudentByUsername(value.username);
            if (duplicated && Number(duplicated.id) !== Number(studentId)) {
                throw new AppError('Student code already exists', 409, 'CONFLICT');
            }

            await repository.updateStudent(studentId, { ...value, isActive: isActive ? 1 : 0 });
            const updated = await repository.findStudentById(studentId);
            return toStudentResponse(updated);
        } finally {
            connection.release();
        }
    }

    async deleteStudent(studentId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const existing = await repository.findStudentById(studentId);
            if (!existing) {
                throw new AppError('Student not found', 404, 'NOT_FOUND');
            }

            await repository.deactivateStudent(studentId);
            return { deactivated: true };
        } finally {
            connection.release();
        }
    }

    async getOverview(studentId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const overview = await repository.getStudentOverview(studentId);
            if (!overview) {
                throw new AppError('Student not found', 404, 'NOT_FOUND');
            }

            return {
                profile: {
                    studentId: overview.id,
                    studentCode: overview.username,
                    fullName: overview.full_name,
                    className: overview.class_name,
                    email: overview.email,
                },
                totalAttempts: Number(overview.total_attempts),
                averageScore: Number(Number(overview.average_score).toFixed(2)),
            };
        } finally {
            connection.release();
        }
    }

    async listStudentResults(studentId, query) {
        const { page, pageSize } = normalizePagination(query);
        const q = normalizeText(query.q) || null;
        const status = normalizeText(query.status) || null;

        if (status && !['in_progress', 'submitted', 'expired'].includes(status)) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'status', issue: 'invalid_enum' },
            ]);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminStudentsRepository(connection);
            const student = await repository.findStudentById(studentId);
            if (!student) {
                throw new AppError('Student not found', 404, 'NOT_FOUND');
            }

            const { rows, total } = await repository.listStudentResults({ studentId, q, status, page, pageSize });
            return {
                data: rows.map((item) => ({
                    resultId: item.id,
                    attemptId: item.attempt_id,
                    examId: item.exam_id,
                    examTitle: item.exam_title,
                    score: Number(item.score),
                    correctCount: Number(item.correct_count),
                    totalQuestions: Number(item.total_questions),
                    status: item.attempt_status,
                    submittedAt: item.submitted_at,
                })),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
                },
            };
        } finally {
            connection.release();
        }
    }

    async getStudentReport(studentId, format) {
        if (format && format !== 'pdf') {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'format', issue: 'invalid_enum' },
            ]);
        }

        const overview = await this.getOverview(studentId);
        const results = await this.listStudentResults(studentId, { page: 1, pageSize: 100 });

        return {
            format: 'pdf',
            generatedAt: new Date().toISOString(),
            data: {
                overview,
                items: results.data,
            },
            note: 'Local MVP returns JSON payload as report preview',
        };
    }
}
