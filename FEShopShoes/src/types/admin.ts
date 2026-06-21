

export enum Gender {
    MEN = 'MEN',
    WOMEN = 'WOMEN',
    UNISEX = 'UNISEX'
}


export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}


export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED'
}


export interface Brand {
    id?: number;
    name: string;
}


export interface Category {
    id?: number;
    name: string;
    image: string;
}


export interface Role {
    id?: number;
    name: string;
}


export interface User {
    id?: number;
    email: string;
    username: string;
    fullName: string;
    phone: string;
    imageAvt?: string;
    enabled: boolean;
    roles: Role[];
    createdAt: string;
}


export interface ProductVariant {
    id?: number;
    size: number;    // Integer
    color: string;
    stock: number;    // Integer
    price: number;    // Double
    version?: number;    // @Version field - đừng tự set
}


export interface Product {
    id?: number;  // Long
    name: string;
    description: string;
    basePrice: number;  // Double
    salePrice?: number | null;
    totalSold: number;  // Integer, default 0
    category?: Category | null;
    brand?: Brand | null;
    images: string[];
    slug: string;
    active: boolean;
    gender: 'MEN' | 'WOMEN' | 'UNISEX' | string;
    material: string;
    soleType: string;
    origin: string;
    variants?: ProductVariant[];  // loaded separately via /api/v1/variant/product/{id}
}


export interface OrderItem {
    id?: number;
    productId?: number;
    productName?: string;
    image?: string;
    size?: number | string;
    color?: string;
    quantity: number;
    priceAtPurchase: number;
    isReviewed?: boolean;
    canReview?: boolean;
    variant?: ProductVariant;
}


export interface Order {
    id?: number;
    orderNumber: string;
    user: User;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
}


export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    lowStockItems: number;
}



