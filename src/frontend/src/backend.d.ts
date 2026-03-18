import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductInput {
    name: string;
    description: string;
    isActive: boolean;
    imageUrl: string;
    isFeatured: boolean;
    category: string;
    price: bigint;
}
export interface CreateOrderInput {
    gameId: string;
    productId: bigint;
    quantity: bigint;
}
export interface OrderWithProduct {
    id: bigint;
    status: OrderStatus;
    userId: Principal;
    createdAt: bigint;
    gameId: string;
    productId: bigint;
    quantity: bigint;
    totalPrice: bigint;
    product: Product;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    isActive: boolean;
    imageUrl: string;
    isFeatured: boolean;
    category: string;
    price: bigint;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(input: ProductInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    creditWallet(user: Principal, amount: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<OrderWithProduct>>;
    getAnnouncement(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMyOrders(): Promise<Array<OrderWithProduct>>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletBalance(): Promise<bigint>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(input: CreateOrderInput): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAnnouncement(text: string): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, input: ProductInput): Promise<void>;
}
