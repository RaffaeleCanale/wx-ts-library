import { Dependencies, ValueOrFactory, ValueOrFactoryObj } from './types';
import { getValueOf } from './utils';

const dependenciesSingleton: Partial<ValueOrFactoryObj<Dependencies>> = {};

/**
 * Clear out all the registered dependencies. This is mostly useful for tests.
 */
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
    dependency: ValueOrFactory<Dependencies[K]>,
): void {
    (dependenciesSingleton as Record<string, unknown>)[key] = dependency;
}

/**
 * Register multiple global dependencies.
 *
 * @param dependencies Map of dependencies
 */
export function registerAll(
    dependencies: Partial<ValueOrFactoryObj<Dependencies>>,
): void {
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
    const currentValue = dependenciesSingleton[key] as ValueOrFactory<
        Dependencies[K]
    >;
    if (!currentValue) {
        throw new Error(`Dependency ${key as string} not found`);
    }

    const newValue = getValueOf<Dependencies[K]>(currentValue);
    dependenciesSingleton[key] = newValue;
    return newValue;
}

export function getAllDependencies(): Partial<Dependencies> {
    const result: Record<string, unknown> = {};
    Object.keys(dependenciesSingleton).forEach((key) => {
        result[key] = getDependency(key as never);
    });
    return result;
}
