export interface Role {
    id?: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    basePrice: number;
    salePrice: number;
    totalSold: number;
    category: { id: number; name?: string } | null;
    brand: { id: number; name?: string } | null;
    images: string[]; // URL từ BE trả về
    image?: string; // Một số API có thể trả về ảnh đơn lẻ
    imageUrl?: string; // Thêm tùy chọn cho API trả imageUrl
    imageFiles?: File[]; // Dùng để upload
    slug: string;
    active: boolean;
    gender: Gender;
    material: string;
    soleType: string;
    origin: string;
    variants: ProductVariant[];
}

export interface Review {
    id: number;
    userId: number;
    orderItemId: number;
    username: string;
    rating: number;
    comment: string;
    productId: number;
    images: string[];
    createdAt: string;
}

export interface ProductReviewSummary {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export enum Gender {
    MEN = 'MEN',
    WOMEN = 'WOMEN',
    UNISEX = 'UNISEX'
}

export interface ProductVariant {
    id?: number;
    product?: Product;
    size: number;
    color: string;
    stock: number;
    price: number;
}

export interface CartItem {
    id: number;          // DB id
    product: Product;
    variant: ProductVariant;
    quantity: number;
    price: number;
    image?: string;
}

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    roles: string[];
    token?: string;
    accessToken?: string;
    // Giữ lại address để tương thích với component Profile
    address?: {
        province?: string;
        ward?: string;
        specificAddress?: string;
    };
}