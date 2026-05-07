import crypto from 'crypto';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { reservationsRepository } from '../repositories/reservations.repository.js';
import { createReservationSchema } from '../schemas/reservations.schemas.js';

export const reservationsController = {
  tableTypes: asyncHandler(async (req, res) => {
    const tableTypes = await reservationsRepository.listTableTypes();
    res.json({ success: true, data: tableTypes });
  }),

  create: asyncHandler(async (req, res) => {
    const payload = createReservationSchema.parse(req.body);
    const reservation = await reservationsRepository.createReservation({
      id: crypto.randomUUID(),
      userId: req.user.sub,
      reservationDate: payload.reservationDate,
      reservationTime: payload.reservationTime.length === 5 ? `${payload.reservationTime}:00` : payload.reservationTime,
      guestCount: payload.guestCount,
      tableTypeId: payload.tableTypeId,
      diningExperienceId: payload.diningExperienceId,
      status: 'confirmed',
      allergies: payload.allergies,
      dietaryRestrictions: payload.dietaryRestrictions,
      specialOccasion: payload.specialOccasion,
      guestNotes: payload.guestNotes,
    });

    res.status(201).json({ success: true, message: 'Reservation created', data: reservation });
  }),

  listMine: asyncHandler(async (req, res) => {
    const reservations = await reservationsRepository.listUserReservations(req.user.sub);
    res.json({ success: true, data: reservations });
  }),

  listAll: asyncHandler(async (req, res) => {
    const reservations = await reservationsRepository.listAllReservations();
    res.json({ success: true, data: reservations });
  }),

  cancel: asyncHandler(async (req, res) => {
    const reservation = await reservationsRepository.findReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await reservationsRepository.cancelReservation(req.params.id);
    res.json({ success: true, message: 'Reservation cancelled', data: updated });
  }),
};
