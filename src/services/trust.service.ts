import { api } from '../lib/api-client';

export interface VerificationDocument {
  uid: string;
  document_type: 'cac' | 'id' | 'address';
  file: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected';
  extracted_rc_number?: string;
  confidence_score: number;
  created_at: string;
}

export const trustService = {
  uploadDocument: async (docType: string, file: File): Promise<VerificationDocument> => {
    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('file', file);

    return api.post<VerificationDocument>('/trust/upload/', formData);
  },

  getStatus: async (): Promise<VerificationDocument[]> => {
    return api.get<VerificationDocument[]>('/trust/status/');
  }
};
