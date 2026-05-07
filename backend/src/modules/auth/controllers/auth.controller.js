import crypto from 'crypto';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { comparePassword, hashPassword } from '../../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../utils/jwt.js';
import { authRepository } from '../repositories/auth.repository.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

async function buildAuthResponse(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const decodedRefresh = verifyRefreshToken(refreshToken);

  await authRepository.storeRefreshToken({
    id: crypto.randomUUID(),
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(decodedRefresh.exp * 1000),
  });

  return {
    user: serializeUser(user),
    accessToken,
    refreshToken,
  };
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existingUser = await authRepository.findUserByEmail(payload.email);

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await authRepository.createUser({
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      passwordHash,
      role: 'user',
    });

    const auth = await buildAuthResponse(user);
    res.status(201).json({ success: true, message: 'User registered successfully', data: auth });
  }),

  login: asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await authRepository.findUserByEmail(payload.email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(payload.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const auth = await buildAuthResponse(user);
    res.json({ success: true, message: 'Login successful', data: auth });
  }),

  refresh: asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body);
    verifyRefreshToken(payload.refreshToken);

    const storedToken = await authRepository.findRefreshToken(payload.refreshToken);
    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
    }

    await authRepository.revokeRefreshToken(payload.refreshToken);
    const auth = await buildAuthResponse(storedToken);
    res.json({ success: true, message: 'Token refreshed', data: auth });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const payload = forgotPasswordSchema.parse(req.body);
    const user = await authRepository.findUserByEmail(payload.email);

    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset token was generated' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await authRepository.createPasswordResetToken({
      id: crypto.randomUUID(),
      userId: user.id,
      token: rawToken,
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken: rawToken,
        expiresAt: expiresAt.toISOString(),
        note: 'Development-only response. Integrate email delivery later.',
      },
    });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const payload = resetPasswordSchema.parse(req.body);
    const tokenRecord = await authRepository.findPasswordResetToken(payload.token);

    if (!tokenRecord || tokenRecord.used_at || new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token invalid or expired' });
    }

    const passwordHash = await hashPassword(payload.newPassword);
    await authRepository.updateUserPassword(tokenRecord.user_id, passwordHash);
    await authRepository.markPasswordResetTokenUsed(tokenRecord.id);
    await authRepository.revokeAllRefreshTokensForUser(tokenRecord.user_id);

    res.json({ success: true, message: 'Password updated successfully' });
  }),

  logout: asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body);
    await authRepository.revokeRefreshToken(payload.refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authRepository.findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  }),
};
