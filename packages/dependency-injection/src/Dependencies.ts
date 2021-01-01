import { Dependencies } from './types';

const dependenciesSingleton: Partial<Dependencies> = {};

export function clear(): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const dep of Object.getOwnPropertyNames(dependenciesSingleton)) {
        delete (dependenciesSingleton as any)[dep];
    }
}

/**
 * Register a global dependency.
 *
 * @param key Key of the dependency (must be globally unique)
 * @param dependency Dependency object
 */
export function register<K extends keyof Dependencies>(
    key: K,
    dependency: Dependencies[K],
): void {
    dependenciesSingleton[key] = dependency;
}

/**
 * Register multiple global dependencies.
 *
 * @param dependencies Map of dependencies
 */
export function registerAll(dependencies: Partial<Dependencies>): void {
    Object.assign(dependenciesSingleton, dependencies);
}

/**
 * Get a globally registered dependency.
 *
 * @param key Key of the dependency
 */
export function getDependency<K extends keyof Dependencies>(
    key: K,
): Dependencies[K] {
    const result = dependenciesSingleton[key];
    if (!result) {
        throw new Error(`Dependency ${key as string} not found`);
    }
    return result;
}

export function getAllDependencies(): Partial<Dependencies> {
    return dependenciesSingleton;
}
