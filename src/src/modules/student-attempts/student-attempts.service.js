const { pool, withTransaction } = require('../../config/database');
const { AppError } = require('../../shared/errors/app-error');
const { StudentAttemptsRepository } = require('./student-attempts.repository');

function isExpired(expiresAt) {
	return new Date(expiresAt).getTime() <= Date.now();
}

function toOptionLabel(value) {
	return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function toAttemptResponse(attempt, questions, answerByQuestionId) {
	const remainingSeconds = Math.max(0, Math.floor((new Date(attempt.expires_at).getTime() - Date.now()) / 1000));

	return {
		id: attempt.id,
		examId: attempt.exam_id,
		studentId: attempt.student_id,
		startedAt: attempt.started_at,
		expiresAt: attempt.expires_at,
		submittedAt: attempt.submitted_at,
		status: attempt.status,
		score: attempt.score,
		correctCount: attempt.correct_count,
		totalQuestions: attempt.total_questions,
		remainingSeconds,
		questions: questions.map((question) => ({
			id: question.id,
			content: question.content,
			optionA: question.option_a,
			optionB: question.option_b,
			optionC: question.option_c,
			optionD: question.option_d,
			orderNo: question.order_no,
			selectedOptionLabel: answerByQuestionId.get(question.id) || null,
		})),
	};
}

function ensureStudentOwnsAttempt(attempt, studentId) {
	if (!attempt) {
		throw new AppError('Attempt not found', 404, 'NOT_FOUND');
	}

	if (attempt.student_id !== studentId) {
		throw new AppError('You do not have permission to access this attempt', 403, 'FORBIDDEN');
	}
}

class StudentAttemptsService {
	async getAttemptDetail(attemptId, studentId) {
		const connection = await pool.getConnection();

		try {
			const repository = new StudentAttemptsRepository(connection);
			const attempt = await repository.findAttemptById(attemptId);

			ensureStudentOwnsAttempt(attempt, studentId);

			const questions = await repository.listQuestionsByAttempt(attemptId);
			const answers = await repository.listAnswersByAttempt(attemptId);
			const answerByQuestionId = new Map(answers.map((item) => [item.question_id, item.selected_option_label]));

			return toAttemptResponse(attempt, questions, answerByQuestionId);
		} finally {
			connection.release();
		}
	}

	async saveAnswer(attemptId, questionId, selectedOptionLabel, studentId) {
		const normalizedOption = toOptionLabel(selectedOptionLabel);
		if (!['A', 'B', 'C', 'D'].includes(normalizedOption)) {
			throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
				{ field: 'selectedOptionLabel', issue: 'invalid_enum' },
			]);
		}

		return withTransaction(async (connection) => {
			const repository = new StudentAttemptsRepository(connection);
			const attempt = await repository.findAttemptByIdForUpdate(attemptId);

			ensureStudentOwnsAttempt(attempt, studentId);

			if (attempt.status === 'submitted') {
				throw new AppError('Attempt has already been submitted', 422, 'BUSINESS_RULE_VIOLATION');
			}

			if (attempt.status === 'expired' || isExpired(attempt.expires_at)) {
				await repository.markAttemptExpired(attemptId);
				throw new AppError('Attempt has expired and cannot be modified', 422, 'BUSINESS_RULE_VIOLATION');
			}

			const question = await repository.findQuestionInAttempt(attemptId, questionId);
			if (!question) {
				throw new AppError('Question does not belong to this attempt', 422, 'BUSINESS_RULE_VIOLATION');
			}

			await repository.upsertAnswer({
				attemptId,
				questionId,
				selectedOptionLabel: normalizedOption,
			});

			return {
				attemptId,
				questionId,
				selectedOptionLabel: normalizedOption,
			};
		});
	}

	async submitAttempt(attemptId, studentId) {
		return withTransaction(async (connection) => {
			const repository = new StudentAttemptsRepository(connection);
			const attempt = await repository.findAttemptByIdForUpdate(attemptId);

			ensureStudentOwnsAttempt(attempt, studentId);

			if (attempt.status === 'submitted') {
				throw new AppError('Attempt has already been submitted', 422, 'BUSINESS_RULE_VIOLATION');
			}

			if (attempt.status === 'expired' || isExpired(attempt.expires_at)) {
				await repository.markAttemptExpired(attemptId);
				throw new AppError('Attempt has expired and cannot be submitted', 422, 'BUSINESS_RULE_VIOLATION');
			}

			const questions = await repository.listQuestionsByAttempt(attemptId);
			if (questions.length === 0) {
				throw new AppError('Attempt has no questions', 422, 'BUSINESS_RULE_VIOLATION');
			}

			const answers = await repository.listAnswersByAttempt(attemptId);
			const selectedByQuestionId = new Map(answers.map((answer) => [answer.question_id, answer.selected_option_label]));

			let correctCount = 0;
			for (const question of questions) {
				const selected = selectedByQuestionId.get(question.id);
				if (selected && selected === question.correct_option_label) {
					correctCount += 1;
				}
			}

			const totalQuestions = questions.length;
			const score = Number(((correctCount / totalQuestions) * 100).toFixed(2));

			await repository.setAnswerCorrectness(attemptId);
			await repository.markAttemptSubmitted({
				attemptId,
				score,
				correctCount,
				totalQuestions,
			});

			const resultId = await repository.createResult({
				attemptId,
				examId: attempt.exam_id,
				studentId: attempt.student_id,
				score,
				correctCount,
				totalQuestions,
			});

			const result = await repository.findResultByAttemptId(attemptId);

			return {
				resultId,
				attemptId,
				examId: attempt.exam_id,
				studentId: attempt.student_id,
				score,
				correctCount,
				totalQuestions,
				submittedAt: result ? result.submitted_at : null,
			};
		});
	}
}

module.exports = { StudentAttemptsService };
