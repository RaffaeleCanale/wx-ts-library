export interface DependencyRef {
    key: keyof Dependencies;
    lazy: boolean;
}

export interface Injectable {
    _dependencies?: Record<string, DependencyRef>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Dependencies {}

export type Provider<T> = () => T;

export type ValueOrFactory<T> = T | Provider<T> | (new () => T);

export type ValueOrFactoryObj<T> = {
    [K in keyof T]: ValueOrFactory<T[K]>;
};
