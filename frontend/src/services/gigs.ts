import api from './api';
import type { Gig, Category, Skill } from '../types';

interface GigFilters {
  category?: number;
  min_budget?: number;
  max_budget?: number;
  sort?: 'recent' | 'budget_low' | 'budget_high';
  page?: number;
  limit?: number;
}

export const gigService = {
  async getGigs(filters?: GigFilters): Promise<Gig[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category.toString());
    if (filters?.min_budget) params.append('min_budget', filters.min_budget.toString());
    if (filters?.max_budget) params.append('max_budget', filters.max_budget.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get<Gig[]>(`/gigs?${params.toString()}`);
    return response.data;
  },

  async getGig(id: number): Promise<Gig> {
    const response = await api.get<Gig>(`/gigs/${id}`);
    return response.data;
  },

  async createGig(data: Partial<Gig>): Promise<Gig> {
    const response = await api.post<Gig>('/gigs', data);
    return response.data;
  },

  async deleteGig(id: number): Promise<void> {
    await api.delete(`/gigs/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/gigs/categories');
    return response.data;
  },

  async getSkills(search?: string): Promise<Skill[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get<Skill[]>(`/gigs/skills${params}`);
    return response.data;
  },

  async getMyGigs(): Promise<Gig[]> {
    const response = await api.get<Gig[]>('/gigs/my-gigs');
    return response.data;
  },

  async saveGig(gigId: number): Promise<void> {
    await api.post(`/gigs/${gigId}/save`);
  },

  async getSavedGigs(): Promise<Gig[]> {
    const response = await api.get<Gig[]>('/gigs/saved/list');
    return response.data;
  },
};