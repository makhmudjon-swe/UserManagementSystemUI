import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  lastLoginAt: string | null;
  registeredAt: string;
  status: string;
}

export interface GetUsersResponse extends Array<User> {}

export interface UpdateUsersRequest {
  ids: string[]; 
  status: number; 
}

export interface DeleteUsersRequest {
  ids: string[];
}

export interface DeleteResponse {
  message: string;
}

export interface DeleteUnverifiedResponse {
  message: string;
  count: number;
}

export const userService = {
  getUsers: async (): Promise<GetUsersResponse> => {
    const response = await api.get<GetUsersResponse>('/users/get');
    return response.data;
  },

  updateUsers: async (data: UpdateUsersRequest): Promise<DeleteResponse> => {
    try {
      const response = await api.put<DeleteResponse>('/users/update', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  deleteUsers: async (data: DeleteUsersRequest): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>('/users/delete', { data });
    return response.data;
  },

  deleteUnverifiedUsers: async (): Promise<DeleteUnverifiedResponse> => {
    const response = await api.delete<DeleteUnverifiedResponse>('/users/delete/unverified');
    return response.data;
  },
};