import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);

  const contacts = await getAllContacts({ page, perPage, sortOrder, sortBy });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId);

  if (!contact) throw createHttpError(404, 'Contact not found!');

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const contact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await deleteContact(contactId);

  if (!contact) throw createHttpError(404, 'Contact not found!');

  res.sendStatus(204);
};

const handleContactUpdate = async (req, res, next, upsert = false) => {
  const { contactId } = req.params;

  const result = await updateContact(contactId, req.body, { upsert });

  if (!result) throw createHttpError(404, 'Contact not found!');

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: upsert
      ? `Successfully upserted a contact!`
      : `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const upsertContactController = (req, res, next) =>
  handleContactUpdate(req, res, next, true);

export const patchContactController = (req, res, next) =>
  handleContactUpdate(req, res, next);
