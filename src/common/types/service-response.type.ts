export type ServiceResponse<T> = {
    success: boolean;
    data?: T;
    message?:string,
    error?: string;
    statusCode?: number;
};