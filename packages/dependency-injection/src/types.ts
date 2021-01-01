export interface DependencyRef {
    name: string;
    lazy: boolean;
}

export interface Injectable {
    _dependencies?: Record<string, DependencyRef>;
}
