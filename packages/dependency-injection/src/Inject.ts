import { Injectable } from './types';

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a getter to a dependency.
 */
export function injectLazy(target: Injectable, key: string): void {
    if (!target._dependencies) {
        target._dependencies = {};
    }
    target._dependencies[key] = { name: key, lazy: true };
}

/**
 * This is a class attribute annotation. Make sure that your class has the `@injectable` annotation.
 *
 * Injects the attribute with a dependency.
 */
export function inject(target: Injectable, key: string): void {
    if (!target._dependencies) {
        target._dependencies = {};
    }
    target._dependencies[key] = { name: key, lazy: false };
}
