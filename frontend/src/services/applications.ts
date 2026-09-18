import api from './api';
import type { Application } from '../types';

export const applicationService = {
  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications');
    return response.data;
  },

  async getGigApplications(gigId: number): Promise<Application[]> {
    const response = await api.get<Application[]>(`/applications/gig/${gigId}`);
    return response.data;
  },

  async acceptApplication(applicationId: number): Promise<{ message: string; contract_id?: number }> {
    const response = await api.post<{ message: string; contract_id?: number }>(`/applications/${applicationId}/accept`);
    return response.data;
  },

  async rejectApplication(applicationId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/applications/${applicationId}/reject`);
    return response.data;
  },
};
