import axiosClient from '../api/axiosClient';

export const UserService = {
    getProfile: (id: number) => axiosClient.get(`/users/${id}`),
    updateProfile: (id: number, data: any) => axiosClient.put(`/users/${id}`, data),
};
