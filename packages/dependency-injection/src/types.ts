export type DependencyRef = {
    key: keyof Dependencies;
    lazy: boolean;
};

export type Injectable = {
    _dependencies?: Record<string, DependencyRef>;
};

export type Dependencies = {};

export type Provider<T> = () => T;

export type ValueOrFactory<T> = T | Provider<T> | (new () => T);

export type ValueOrFactoryObj<T> = {
    [K in keyof T]: ValueOrFactory<T[K]>;
};
