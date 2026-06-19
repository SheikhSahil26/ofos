export type ServiceResponse<T> = {
    map(arg0: (m: any) => any[]): Iterable<readonly [unknown, unknown]> | null | undefined;
    success: boolean;
    data?: T;
    message?:string,
    error?: string;
    statusCode?: number;
};