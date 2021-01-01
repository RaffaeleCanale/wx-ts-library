import { Dependencies, Injectable } from './types';

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a getter to a dependency.
 */
export function injectLazy(target: Injectable, key: keyof Dependencies): void {
    if (!target._dependencies) {
        target._dependencies = {};
    }
    target._dependencies[key] = { key, lazy: true };
}

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a dependency.
 */
export function inject(target: Injectable, key: keyof Dependencies): void {
    if (!target._dependencies) {
        target._dependencies = {};
    }
    target._dependencies[key] = { key, lazy: false };
}
