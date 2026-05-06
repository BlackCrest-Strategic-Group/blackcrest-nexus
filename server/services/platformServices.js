import { logAuditEvent } from './auditService.js';

export const authService = { login: (email) => ({ email }), logout: (email) => ({ email }) };
export const apiService = { ping: () => ({ status: 'ok' }) };
export const auditService = { log: logAuditEvent };
export const permissionsService = { allowedRoles: ['Admin', 'Executive', 'Buyer', 'Supplier', 'Auditor'] };
export const storageService = { adapter: 'local' };
export const notificationsService = { emit: (message) => ({ message, delivered: true }) };
