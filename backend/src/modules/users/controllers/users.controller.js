import { asyncHandler } from '../../../utils/asyncHandler.js';
import { usersRepository } from '../repositories/users.repository.js';
import { updateProfileSchema } from '../schemas/users.schemas.js';

export const usersController = {
  updateProfile: asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body);
    const user = await usersRepository.updateProfile(req.user.sub, payload);
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  }),
};
