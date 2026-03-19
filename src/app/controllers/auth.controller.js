import { AppError } from '../../utils/classes/app-error.js';
import { sendSuccess } from '../../utils/helper/response.js';
import {
	validateRegisterPayload,
	validateLoginPayload,
	validateRefreshTokenPayload,
} from './validators/auth.validators.js';

export class AuthController {
	constructor(authService) {
		this.authService = authService;
	}

	async register(req, res) {
		const { details, value } = validateRegisterPayload(req.body || {});
		if (details.length > 0) {
			throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
		}

		const result = await this.authService.register(value);
		return sendSuccess(res, req, 201, result);
	}

	async login(req, res) {
		const { details, value } = validateLoginPayload(req.body || {});
		if (details.length > 0) {
			throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
		}

		const result = await this.authService.login(value);
		return sendSuccess(res, req, 200, result);
	}

	async refreshToken(req, res) {
		const { details, value } = validateRefreshTokenPayload(req.body || {});
		if (details.length > 0) {
			throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
		}

		const result = await this.authService.refreshToken(value.refreshToken);
		return sendSuccess(res, req, 200, result);
	}

	async logout(req, res) {
		const { details, value } = validateRefreshTokenPayload(req.body || {});
		if (details.length > 0) {
			throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
		}

		const result = await this.authService.logout(value.refreshToken);
		return sendSuccess(res, req, 200, result);
	}
}
