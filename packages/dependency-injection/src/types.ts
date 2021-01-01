export interface DependencyRef {
    key: keyof Dependencies;
    lazy: boolean;
}

export interface Injectable {
    _dependencies?: Record<string, DependencyRef>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Dependencies {}
