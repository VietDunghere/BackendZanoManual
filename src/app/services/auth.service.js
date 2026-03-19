import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { hashToken } from '../../utils/helper/crypto.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/helper/jwt.js';
import { AuthRepository } from '../repositories/auth.repository.js';

function toUserResponse(user) {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		fullName: user.full_name,
		role: user.role,
		className: user.class_name,
		isActive: Boolean(user.is_active),
	};
}

function parseRefreshExp(payload) {
	if (!payload.exp) {
		throw new AppError('Invalid refresh token payload', 401, 'UNAUTHORIZED');
	}

	return new Date(payload.exp * 1000);
}

export class AuthService {
	async register(payload) {
		return withTransaction(async (connection) => {
			const repository = new AuthRepository(connection);

			const existedByUsername = await repository.findUserByUsername(payload.username);
			if (existedByUsername) {
				throw new AppError('Username already exists', 409, 'CONFLICT', [{ field: 'username', issue: 'duplicate' }]);
			}

			if (payload.email) {
				const existedByEmail = await repository.findUserByEmail(payload.email);
				if (existedByEmail) {
					throw new AppError('Email already exists', 409, 'CONFLICT', [{ field: 'email', issue: 'duplicate' }]);
				}
			}

			const passwordHash = await bcrypt.hash(payload.password, 10);

			const userId = await repository.createUser({
				username: payload.username,
				email: payload.email,
				passwordHash,
				fullName: payload.fullName,
				role: payload.role,
				className: payload.className,
			});

			const user = await repository.findUserById(userId);
			const accessToken = createAccessToken(user);
			const refreshToken = createRefreshToken(user);
			const refreshPayload = verifyRefreshToken(refreshToken);

			await repository.insertRefreshToken({
				userId: user.id,
				tokenHash: hashToken(refreshToken),
				expiresAt: parseRefreshExp(refreshPayload),
			});

			return {
				user: toUserResponse(user),
				accessToken,
				refreshToken,
			};
		});
	}

	async login(payload) {
		const connection = await pool.getConnection();

		try {
			const repository = new AuthRepository(connection);
			const user = await repository.findUserByUsername(payload.username);

			if (!user) {
				throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
			}

			if (!user.is_active) {
				throw new AppError('Account is inactive', 403, 'FORBIDDEN');
			}

			const isPasswordMatched = await bcrypt.compare(payload.password, user.password_hash);
			if (!isPasswordMatched) {
				throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
			}

			const accessToken = createAccessToken(user);
			const refreshToken = createRefreshToken(user);
			const refreshPayload = verifyRefreshToken(refreshToken);

			await repository.insertRefreshToken({
				userId: user.id,
				tokenHash: hashToken(refreshToken),
				expiresAt: parseRefreshExp(refreshPayload),
			});

			return {
				user: toUserResponse(user),
				accessToken,
				refreshToken,
			};
		} finally {
			connection.release();
		}
	}

	async refreshToken(refreshToken) {
		return withTransaction(async (connection) => {
			const repository = new AuthRepository(connection);

			let payload;
			try {
				payload = verifyRefreshToken(refreshToken);
			} catch (_error) {
				throw new AppError('Refresh token is invalid or expired', 401, 'UNAUTHORIZED');
			}

			if (payload.type !== 'refresh') {
				throw new AppError('Invalid refresh token type', 401, 'UNAUTHORIZED');
			}

			const currentTokenHash = hashToken(refreshToken);
			const activeToken = await repository.findActiveRefreshToken(currentTokenHash);

			if (!activeToken) {
				throw new AppError('Refresh token is invalid or revoked', 401, 'UNAUTHORIZED');
			}

			const user = await repository.findUserById(Number(payload.sub));
			if (!user || !user.is_active) {
				throw new AppError('User is not available', 401, 'UNAUTHORIZED');
			}

			const newAccessToken = createAccessToken(user);
			const newRefreshToken = createRefreshToken(user);
			const newRefreshPayload = verifyRefreshToken(newRefreshToken);
			const newRefreshHash = hashToken(newRefreshToken);

			await repository.revokeRefreshToken(currentTokenHash, newRefreshHash);
			await repository.insertRefreshToken({
				userId: user.id,
				tokenHash: newRefreshHash,
				expiresAt: parseRefreshExp(newRefreshPayload),
			});

			return {
				user: toUserResponse(user),
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			};
		});
	}

	async logout(refreshToken) {
		const connection = await pool.getConnection();

		try {
			const repository = new AuthRepository(connection);
			await repository.revokeRefreshToken(hashToken(refreshToken));
			return { loggedOut: true };
		} finally {
			connection.release();
		}
	}
}
