import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { usersRepository } from '../repositories/users.repository.js';
import { updateProfileSchema } from '../schemas/users.schemas.js';

// Controlador del perfil del usuario autenticado.
export const usersController = {
  updateProfile: asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body);
    const user = await usersRepository.updateProfile(req.user.sub, payload);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  }),
};
