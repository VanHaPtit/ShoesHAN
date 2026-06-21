import axiosClient from '../api/axiosClient';
import { Product, ProductVariant } from '../types';

export const ProductService = {
  getAll: async () => {
    const response = await axiosClient.get<Product[]>('/product');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosClient.get<Product>(`/product/${id}`);
    return response.data;
  },

  getByCategory: async (categoryName: string) => {
    const response = await axiosClient.get<Product[]>(`/product?category=${categoryName}`);
    return response.data;
  },

  getFlashSales: async () => {
    const response = await axiosClient.get<Product[]>('/product/sales');
    return response.data;
  },

  search: async (keyWord: string) => {
    const response = await axiosClient.get<Product[]>(`/product/search?keyWord=${keyWord}`);
    return response.data;
  },

  getVariants: async (productId: number) => {
    const response = await axiosClient.get<ProductVariant[]>(`/variant/product/${productId}`);
    return response.data;
  }
};

export default ProductService;
