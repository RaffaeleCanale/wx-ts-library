import { Dependencies, Injectable } from './types';

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a getter to a dependency.
 */
export function injectLazy(target: any, key: keyof Dependencies): void {
    const injectable = target as Injectable;
    if (!injectable._dependencies) {
        injectable._dependencies = {};
    }
    injectable._dependencies[key] = { key, lazy: true };
}

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a dependency.
 */
export function inject(target: any, key: keyof Dependencies): void {
    const injectable = target as Injectable;
    if (!injectable._dependencies) {
        injectable._dependencies = {};
    }
    injectable._dependencies[key] = { key, lazy: false };
}

export function injectNamed(key: keyof Dependencies): PropertyDecorator {
    return (target: any) => inject(target, key);
}
