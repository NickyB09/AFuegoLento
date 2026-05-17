import crypto from 'crypto';

import { ApiError } from '../../../utils/apiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { tablesRepository } from '../repositories/tables.repository.js';
import { tableSchema, tableTypeSchema } from '../schemas/tables.schemas.js';

// Controladores para exponer configuración de mesas al frontend y al admin.
export const tablesController = {
  listTypes: asyncHandler(async (req, res) => {
    const tableTypes = await tablesRepository.listTableTypes();
    res.json({ success: true, data: tableTypes });
  }),

  adminList: asyncHandler(async (req, res) => {
    const [tableTypes, tables] = await Promise.all([
      tablesRepository.listTableTypes(),
      tablesRepository.listTables(),
    ]);

    res.json({ success: true, data: { tableTypes, tables } });
  }),

  createType: asyncHandler(async (req, res) => {
    const payload = tableTypeSchema.parse(req.body);
    const tableType = await tablesRepository.createTableType({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Table type created', data: tableType });
  }),

  updateType: asyncHandler(async (req, res) => {
    const payload = tableTypeSchema.parse(req.body);
    const tableType = await tablesRepository.updateTableType(req.params.id, payload);

    if (!tableType) {
      throw new ApiError(404, 'Table type not found');
    }

    res.json({ success: true, message: 'Table type updated', data: tableType });
  }),

  deleteType: asyncHandler(async (req, res) => {
    const tableType = await tablesRepository.deleteTableType(req.params.id);

    if (!tableType) {
      throw new ApiError(404, 'Table type not found');
    }

    res.json({ success: true, message: 'Table type deleted' });
  }),

  createTable: asyncHandler(async (req, res) => {
    const payload = tableSchema.parse(req.body);
    const table = await tablesRepository.createTable({ id: crypto.randomUUID(), ...payload });
    res.status(201).json({ success: true, message: 'Table created', data: table });
  }),

  updateTable: asyncHandler(async (req, res) => {
    const payload = tableSchema.parse(req.body);
    const table = await tablesRepository.updateTable(req.params.id, payload);

    if (!table) {
      throw new ApiError(404, 'Table not found');
    }

    res.json({ success: true, message: 'Table updated', data: table });
  }),

  deleteTable: asyncHandler(async (req, res) => {
    const table = await tablesRepository.deleteTable(req.params.id);

    if (!table) {
      throw new ApiError(404, 'Table not found');
    }

    res.json({ success: true, message: 'Table deleted' });
  }),
};
