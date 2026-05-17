import crypto from 'crypto';

import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { reservationsRepository } from '../repositories/reservations.repository.js';
import { createReservationSchema, updateReservationSchema, updateReservationStatusSchema } from '../schemas/reservations.schemas.js';

const OPENING_HOUR = 18;
const CLOSING_HOUR = 23;

// Evalúa reglas básicas del negocio antes de crear o editar una reserva.
function validateReservationDateTime(reservationDate, reservationTime) {
  const now = new Date();
  const candidate = new Date(`${reservationDate}T${reservationTime}`);
  const reservationHour = Number(reservationTime.slice(0, 2));

  if (Number.isNaN(candidate.getTime())) {
    throw new ApiError(400, 'Reservation date or time is invalid');
  }

  if (candidate.getTime() < now.getTime()) {
    throw new ApiError(400, 'Reservation must be scheduled in the future');
  }

  if (reservationHour < OPENING_HOUR || reservationHour >= CLOSING_HOUR) {
    throw new ApiError(400, 'Reservation time is outside restaurant hours');
  }
}

// Centraliza validaciones y búsqueda de mesa para reutilizar en create/update.
async function resolveReservationAvailability(payload, excludeReservationId = null) {
  const normalizedTime = payload.reservationTime.length === 5 ? `${payload.reservationTime}:00` : payload.reservationTime;

  validateReservationDateTime(payload.reservationDate, normalizedTime);

  if (payload.tableTypeId) {
    const tableType = await reservationsRepository.findTableTypeById(payload.tableTypeId);
    if (!tableType) {
      throw new ApiError(404, 'Requested table type was not found');
    }

    if (payload.guestCount < tableType.capacity_min || payload.guestCount > tableType.capacity_max) {
      throw new ApiError(400, 'Guest count does not match the selected table type');
    }
  }

  if (payload.diningExperienceId) {
    const experience = await reservationsRepository.findExperienceById(payload.diningExperienceId);
    if (!experience || !experience.is_active) {
      throw new ApiError(404, 'Requested dining experience was not found');
    }
  }

  const availableTable = await reservationsRepository.findAvailableTable({
    reservationDate: payload.reservationDate,
    reservationTime: normalizedTime,
    guestCount: payload.guestCount,
    tableTypeId: payload.tableTypeId || null,
    excludeReservationId,
  });

  if (!availableTable) {
    throw new ApiError(409, 'No tables are available for the selected time and party size');
  }

  return {
    normalizedTime,
    availableTable,
  };
}

// Controladores del dominio de reservas del restaurante.
export const reservationsController = {
  tableTypes: asyncHandler(async (req, res) => {
    const tableTypes = await reservationsRepository.listTableTypes();
    res.json({ success: true, data: tableTypes });
  }),

  create: asyncHandler(async (req, res) => {
    const payload = createReservationSchema.parse(req.body);
    const { normalizedTime, availableTable } = await resolveReservationAvailability(payload);

    const reservation = await reservationsRepository.createReservation({
      id: crypto.randomUUID(),
      userId: req.user.sub,
      reservationDate: payload.reservationDate,
      reservationTime: normalizedTime,
      guestCount: payload.guestCount,
      tableTypeId: payload.tableTypeId || availableTable.table_type_id,
      tableId: availableTable.id,
      diningExperienceId: payload.diningExperienceId,
      status: 'confirmed',
      allergies: payload.allergies,
      dietaryRestrictions: payload.dietaryRestrictions,
      specialOccasion: payload.specialOccasion,
      guestNotes: payload.guestNotes,
    });

    res.status(201).json({ success: true, message: 'Reservation created', data: reservation });
  }),

  update: asyncHandler(async (req, res) => {
    const reservation = await reservationsRepository.findReservationById(req.params.id);
    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }

    if (reservation.user_id !== req.user.sub && req.user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden');
    }

    if (['cancelled', 'finalized'].includes(reservation.status)) {
      throw new ApiError(409, 'This reservation can no longer be edited');
    }

    const payload = updateReservationSchema.parse(req.body);
    const { normalizedTime, availableTable } = await resolveReservationAvailability(payload, reservation.id);

    const updated = await reservationsRepository.updateReservation(req.params.id, {
      reservationDate: payload.reservationDate,
      reservationTime: normalizedTime,
      guestCount: payload.guestCount,
      tableTypeId: payload.tableTypeId || availableTable.table_type_id,
      tableId: availableTable.id,
      diningExperienceId: payload.diningExperienceId,
      allergies: payload.allergies,
      dietaryRestrictions: payload.dietaryRestrictions,
      specialOccasion: payload.specialOccasion,
      guestNotes: payload.guestNotes,
    });

    res.json({ success: true, message: 'Reservation updated', data: updated });
  }),

  listMine: asyncHandler(async (req, res) => {
    const reservations = await reservationsRepository.listUserReservations(req.user.sub);
    res.json({ success: true, data: reservations });
  }),

  listAll: asyncHandler(async (req, res) => {
    const reservations = await reservationsRepository.listAllReservations();
    res.json({ success: true, data: reservations });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const payload = updateReservationStatusSchema.parse(req.body);
    const reservation = await reservationsRepository.updateReservationStatus(req.params.id, payload.status);

    if (!reservation) {
      throw new ApiError(404, 'Reservation not found');
    }

    res.json({ success: true, message: 'Reservation status updated', data: reservation });
  }),

  cancel: asyncHandler(async (req, res) => {
    const reservation = await reservationsRepository.findReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (reservation.status === 'finalized') {
      throw new ApiError(409, 'A finalized reservation cannot be cancelled');
    }

    const updated = await reservationsRepository.cancelReservation(req.params.id);
    res.json({ success: true, message: 'Reservation cancelled', data: updated });
  }),
};
