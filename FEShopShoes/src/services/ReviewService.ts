import axios from 'axios';
import { Review, ProductReviewSummary } from '../types';
import axiosClient from '../api/axiosClient';

export const ReviewService = {
    getByProductId: async (productId: number): Promise<ProductReviewSummary> => {
        const response = await axiosClient.get(`/reviews/product/${productId}`);
        return response.data;
    }
};
