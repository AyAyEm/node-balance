export declare type Awaited<T> = Promise<T> | T;
export declare type InStringOf<T> = {
    [P in keyof T]: T[P] extends (number | symbol) ? string : T[P];
};