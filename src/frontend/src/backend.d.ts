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
export interface MemberInfo {
    principal: Principal;
    adminLevel: AdminLevel;
    profile?: UserProfile;
}
export interface Request {
    id: bigint;
    status: RequestStatus;
    paymentMethod: PaymentMethod;
    createdAt: bigint;
    user: Principal;
    amount: bigint;
    transactionId: string;
}
export interface PaymentSettings {
    nagad: string;
    bkash: string;
    rocket: string;
}
export interface SiteSettings {
    siteName: string;
    logoUrl: string;
}
export interface RechargeRequestInput {
    paymentMethod: PaymentMethod;
    amount: bigint;
    transactionId: string;
}
export interface Banner {
    id: bigint;
    title: string;
    description: string;
    isActive: boolean;
    imageUrl: string;
}
export interface CreateOrderInput {
    gameId: string;
    productId: bigint;
    quantity: bigint;
}
export interface BannerInput {
    title: string;
    description: string;
    isActive: boolean;
    imageUrl: string;
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
export interface UserProfile {
    name: string;
}
export enum AdminLevel {
    none = "none",
    superAdmin = "superAdmin",
    subAdmin = "subAdmin"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    processing = "processing"
}
export enum PaymentMethod {
    nagad = "nagad",
    bkash = "bkash",
    rocket = "rocket"
}
export enum RequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBanner(input: BannerInput): Promise<bigint>;
    addProduct(input: ProductInput): Promise<bigint>;
    approveRechargeRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    creditWallet(user: Principal, amount: bigint): Promise<void>;
    deleteBanner(id: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllMembers(): Promise<Array<MemberInfo>>;
    getAllOrders(): Promise<Array<OrderWithProduct>>;
    getAnnouncement(): Promise<string>;
    getBanners(): Promise<Array<Banner>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getMyAdminLevel(): Promise<AdminLevel>;
    getMyOrders(): Promise<Array<OrderWithProduct>>;
    getPaymentSettings(): Promise<PaymentSettings>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getRechargeRequests(): Promise<Array<Request>>;
    getSiteSettings(): Promise<SiteSettings>;
    getUserAdminLevel(user: Principal): Promise<AdminLevel>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletBalance(): Promise<bigint>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(input: CreateOrderInput): Promise<bigint>;
    rejectRechargeRequest(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAnnouncement(text: string): Promise<void>;
    setPaymentSettings(settings: PaymentSettings): Promise<void>;
    setSiteSettings(settings: SiteSettings): Promise<void>;
    setSubAdmin(user: Principal, enable: boolean): Promise<void>;
    setSuperAdminRole(user: Principal, enable: boolean): Promise<void>;
    submitRechargeRequest(input: RechargeRequestInput): Promise<bigint>;
    updateBanner(id: bigint, input: BannerInput): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, input: ProductInput): Promise<void>;
}
