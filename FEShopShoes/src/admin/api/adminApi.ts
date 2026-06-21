// services/adminApi.ts
// Tất cả API calls cho admin dùng axiosClient (đã có JWT interceptor)

import axiosClient from '../../api/axiosClient';
import { Product, ProductVariant, Category, Brand, Order } from '../../types/admin';

// ─── Product API ─────────────────────────────────────────────────────────────

export const productApi = {

    getAll: (): Promise<Product[]> =>
        axiosClient.get('/product?all=true').then(r => r.data),

    getById: (id: number): Promise<Product> =>
        axiosClient.get(`/product/${id}`).then(r => r.data),

    /**
     * POST /api/v1/product  (multipart/form-data)
     * @RequestPart("product") Product  +  @RequestPart("files") List<MultipartFile>
     */
    create: (product: Product, files: File[]): Promise<Product> => {
        const fd = new FormData();
        // Gửi object Product dưới dạng JSON blob - Spring đọc @RequestPart("product")
        fd.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));
        files.forEach(f => fd.append('files', f));
        // KHÔNG set Content-Type header - axios tự set multipart boundary
        return axiosClient.post('/product', fd).then(r => r.data);
    },

    /**
     * PUT /api/v1/product/{id}  (multipart/form-data)
     */
    update: (id: number, product: Product, files: File[]): Promise<Product> => {
        const fd = new FormData();
        fd.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));
        files.forEach(f => fd.append('files', f));
        return axiosClient.put(`/product/${id}`, fd).then(r => r.data);
    },

    delete: (id: number): Promise<string> =>
        axiosClient.delete(`/product/${id}`).then(r => r.data),

    search: (keyword: string): Promise<Product[]> =>
        axiosClient.get('/product/search', { params: { keyWord: keyword } }).then(r => r.data),

    getByCategory: (category: string): Promise<Product[]> =>
        axiosClient.get('/product', { params: { category } }).then(r => r.data),

    importExcelZip: (file: File): Promise<any> => {
        const fd = new FormData();
        fd.append('file', file);
        return axiosClient.post('/Excel/import', fd).then(r => r.data);
    },
};

// ─── Variant API ─────────────────────────────────────────────────────────────

export const variantApi = {

    getAll: (): Promise<ProductVariant[]> =>
        axiosClient.get('/variant').then(r => r.data),

    getByProduct: (productId: number): Promise<ProductVariant[]> =>
        axiosClient.get(`/variant/product/${productId}`).then(r => r.data),

    /**
     * POST /api/v1/variant
     * Body: ProductVariant với product: { id: number }
     */
    create: (productId: number, variant: Omit<ProductVariant, 'id' | 'version'>): Promise<ProductVariant> =>
        axiosClient.post('/variant', {
            ...variant,
            product: { id: productId },
        }).then(r => r.data),

    /**
     * PUT /api/v1/variant/{id}
     */
    update: (id: number, productId: number, variant: ProductVariant): Promise<ProductVariant> =>
        axiosClient.put(`/variant/${id}`, {
            ...variant,
            product: { id: productId },
        }).then(r => r.data),

    delete: (id: number): Promise<string> =>
        axiosClient.delete(`/variant/${id}`).then(r => r.data),
};

// ─── Category & Brand API (nếu có endpoint) ──────────────────────────────────

export const categoryApi = {
    getAll: (): Promise<Category[]> =>
        axiosClient.get('/category').then(r => r.data),

    getById: (id: number): Promise<Category> =>
        axiosClient.get(`/category/${id}`).then(r => r.data),

    /**
     * POST /api/v1/category
     * @RequestPart("category") Category + @RequestPart("file") MultipartFile
     */
    create: (category: Omit<Category, 'id'>, file: File): Promise<Category> => {
        const fd = new FormData();
        // Chuyển object category thành Blob JSON để khớp với @RequestPart phía Spring Boot
        fd.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));
        fd.append('file', file);
        return axiosClient.post('/category', fd).then(r => r.data);
    },

    /**
     * PUT /api/v1/category/{id}
     * @RequestPart("category") Category + @RequestPart(value = "file", required = false)
     */
    update: (id: number, category: Category, file?: File): Promise<Category> => {
        const fd = new FormData();
        fd.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));
        if (file) {
            fd.append('file', file);
        }
        return axiosClient.put(`/category/${id}`, fd).then(r => r.data);
    },

    delete: (id: number): Promise<string> =>
        axiosClient.delete(`/category/${id}`).then(r => r.data),
};

// ─── Brand API ───────────────────────────────────────────────────────────────
// (Giả định Brand có cấu trúc CRUD tương tự Category)

export const brandApi = {
    getAll: (): Promise<Brand[]> =>
        axiosClient.get('/brand').then(r => r.data),

    getById: (id: number): Promise<Brand> =>
        axiosClient.get(`/brand/${id}`).then(r => r.data),

    create: (brand: Omit<Brand, 'id'>): Promise<Brand> => {
        return axiosClient.post('/brand', brand).then(r => r.data);
    },

    update: (id: number, brand: Brand): Promise<Brand> => {
        return axiosClient.put(`/brand/${id}`, brand).then(r => r.data);
    },

    delete: (id: number): Promise<string> =>
        axiosClient.delete(`/brand/${id}`).then(r => r.data),
};



// Order

export const orderApi = {
    // GET /api/v1/orders
    getAll: (): Promise<Order[]> =>
        axiosClient.get('/orders').then(r => r.data),

    // GET /api/v1/orders/{id}
    getById: (id: number): Promise<Order> =>
        axiosClient.get(`/orders/${id}`).then(r => r.data),

    // PUT /api/v1/orders/{id}
    update: (id: number, orderDetails: Partial<Order>): Promise<Order> =>
        axiosClient.put(`/orders/${id}`, orderDetails).then(r => r.data),

    // DELETE /api/v1/orders/{id}
    delete: (id: number): Promise<string> =>
        axiosClient.delete(`/orders/${id}`).then(r => r.data),
};
