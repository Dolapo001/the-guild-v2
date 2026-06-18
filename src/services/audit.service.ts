import { api } from '../lib/api-client';

export interface AuditLog {
  uid: string;
  action: string;
  actor: string | null;
  actorName?: string;
  target?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export const auditService = {
  // Admin-only: platform audit trail (GET /audit/logs/).
  getLogs: async (params?: { action?: string; page?: number }): Promise<AuditLog[]> =>
    api.get<AuditLog[]>('/audit/logs/', { params: params as any }),
};
