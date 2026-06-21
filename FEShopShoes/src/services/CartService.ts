import axiosClient from '../api/axiosClient';

export const CartApiService = {
    getByUserId: (userId: number) => axiosClient.get(`/carts/user/${userId}`),
    addItem: (cartItem: any) => axiosClient.post('/cart-items', cartItem),
    updateItem: (itemId: number, details: any) => axiosClient.put(`/cart-items/${itemId}`, details),
    removeItem: (itemId: number) => axiosClient.delete(`/cart-items/${itemId}`)
};
