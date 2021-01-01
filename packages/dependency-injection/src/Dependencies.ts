const dependenciesSingleton: Record<string, unknown> = {};

export function clear(): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const dep of Object.getOwnPropertyNames(dependenciesSingleton)) {
        delete dependenciesSingleton[dep];
    }
}

/**
 * Register a global dependency.
 *
 * @param name Name of the dependency (must be globally unique)
 * @param dependency Dependency object
 */
export function register(name: string, dependency: unknown): void {
    dependenciesSingleton[name] = dependency;
}

/**
 * Register multiple global dependencies.
 *
 * @param dependencies Map of dependencies
 */
export function registerAll(dependencies: Record<string, unknown>): void {
    Object.assign(dependenciesSingleton, dependencies);
}

/**
 * Get a globally registered dependency.
 *
 * @param name Name of the dependency
 */
export function getDependency<T>(name: string): T {
    const result = dependenciesSingleton[name];
    if (!result) {
        throw new Error(`Dependency ${name} not found`);
    }
    return result as T;
}

export function getAllDependencies(): Record<string, unknown> {
    return dependenciesSingleton;
}
