export type DependencyRef = {
    key: keyof Dependencies;
    lazy: boolean;
};

export type Injectable = {
    _dependencies?: Record<string, DependencyRef>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/consistent-type-definitions
export interface Dependencies {}

export type Provider<T> = () => T;

export type ValueOrFactory<T> = T | Provider<T> | (new () => T);

export type ValueOrFactoryObj<T> = {
    [K in keyof T]: ValueOrFactory<T[K]>;
};
