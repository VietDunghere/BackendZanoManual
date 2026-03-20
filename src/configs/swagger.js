import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BackendZano API',
      version: '1.0.0',
      description: 'REST API cho hệ thống thi trắc nghiệm online',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Meta: {
          type: 'object',
          properties: {},
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'UNAUTHORIZED' },
                message: { type: 'string', example: 'Invalid or expired access token' },
                details: {
                  type: 'array',
                  nullable: true,
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'username' },
                      issue: { type: 'string', example: 'required' },
                    },
                  },
                },
              },
            },
            meta: { $ref: '#/components/schemas/Meta' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', nullable: true, example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'student'] },
            className: { type: 'string', nullable: true, example: 'CS01' },
            isActive: { type: 'boolean', example: true },
          },
        },
        AuthTokensData: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserResponse' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            data: { $ref: '#/components/schemas/AuthTokensData' },
            meta: { $ref: '#/components/schemas/Meta' },
          },
        },
        ExamItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Kiểm tra giữa kỳ môn Toán' },
            description: { type: 'string', nullable: true, example: 'Đề thi 30 câu' },
            type: { type: 'string', enum: ['midterm', 'final', 'practice'] },
            semester: { type: 'string', example: '2024-1' },
            durationMinutes: { type: 'integer', example: 60 },
            status: { type: 'string', enum: ['draft', 'open', 'closed'] },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AttemptStarted: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            examId: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 5 },
            startedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            submittedAt: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['in_progress', 'submitted', 'expired'] },
            score: { type: 'number', nullable: true, example: null },
            correctCount: { type: 'integer', nullable: true, example: null },
            totalQuestions: { type: 'integer', example: 30 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        QuestionWithAnswer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            content: { type: 'string', example: 'Đâu là thủ đô của Việt Nam?' },
            optionA: { type: 'string', example: 'Hà Nội' },
            optionB: { type: 'string', example: 'TP.HCM' },
            optionC: { type: 'string', example: 'Đà Nẵng' },
            optionD: { type: 'string', example: 'Huế' },
            orderNo: { type: 'integer', example: 1 },
            selectedOptionLabel: { type: 'string', enum: ['A', 'B', 'C', 'D'], nullable: true },
          },
        },
        AttemptDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            examId: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 5 },
            startedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            submittedAt: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['in_progress', 'submitted', 'expired'] },
            score: { type: 'number', nullable: true, example: null },
            correctCount: { type: 'integer', nullable: true, example: null },
            totalQuestions: { type: 'integer', example: 30 },
            remainingSeconds: { type: 'integer', example: 3540 },
            questions: {
              type: 'array',
              items: { $ref: '#/components/schemas/QuestionWithAnswer' },
            },
          },
        },
        SaveAnswerResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                attemptId: { type: 'integer', example: 10 },
                questionId: { type: 'integer', example: 1 },
                selectedOptionLabel: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              },
            },
            meta: { $ref: '#/components/schemas/Meta' },
          },
        },
        SubmitResult: {
          type: 'object',
          properties: {
            resultId: { type: 'integer', example: 7 },
            attemptId: { type: 'integer', example: 10 },
            examId: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 5 },
            score: { type: 'number', format: 'float', example: 83.33 },
            correctCount: { type: 'integer', example: 25 },
            totalQuestions: { type: 'integer', example: 30 },
            submittedAt: { type: 'string', format: 'date-time' },
          },
        },
        ScoreRange: {
          type: 'object',
          properties: {
            range: { type: 'string', example: '0-49' },
            count: { type: 'integer', example: 12 },
          },
        },
        AdminStatsSummary: {
          type: 'object',
          properties: {
            totalAttempts: { type: 'integer', example: 450 },
            averageScore: { type: 'number', format: 'float', example: 74.5 },
            scoreDistribution: {
              type: 'array',
              items: { $ref: '#/components/schemas/ScoreRange' },
              example: [
                { range: '0-49', count: 12 },
                { range: '50-69', count: 45 },
                { range: '70-84', count: 130 },
                { range: '85-100', count: 263 },
              ],
            },
          },
        },
      },
    },
  },
  apis: ['./src/routers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
