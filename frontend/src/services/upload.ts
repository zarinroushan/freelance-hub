import api from './api';

export const APPLICATION_RESUME_FOLDER = 'unigigs/application-resumes';

export interface UploadResponse {
  url: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  filename?: string;
  provider?: string;
}

/**
 * Upload an image file to Cloudinary via backend service
 */
export async function uploadImage(
  file: File,
  folder: string = 'unigigs/avatars'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post<UploadResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload a document / file (PDF, DOCX, ZIP, etc.) to Cloudinary via backend service
 */
export async function uploadFile(
  file: File,
  folder: string = 'unigigs/documents'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post<UploadResponse>('/upload/file', formData, {
    params: folder === APPLICATION_RESUME_FOLDER ? { folder } : undefined,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
