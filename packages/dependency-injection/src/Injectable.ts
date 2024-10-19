import { getDependency } from './Dependencies';
import { Injectable } from './types';
import { wrapError } from './utils';

function apply(obj: Injectable): void {
    Object.entries(obj._dependencies ?? {}).forEach(([property, dep]) => {
        if (dep.lazy) {
            Object.defineProperty(obj, property, {
                get() {
                    return getDependency(dep.key);
                },
            });
        } else {
            // eslint-disable-next-line
            (obj as any)[property] = getDependency(dep.key);
        }
    });
}

/**
 * This is a class annotation.
 *
 * Adds a constructor hook that allows to initialize all the `@inject` dependencies.
 */
// eslint-disable-next-line
export function injectable(target: { new (...args: any[]): any }): any {
    // save a reference to the original constructor
    const original = target;

    return class InjectableClass extends original {
        // eslint-disable-next-line
        constructor(...args: any[]) {
            // eslint-disable-next-line
            super(...args);
            try {
                apply(this);
            } catch (error) {
                throw wrapError(
                    error,
                    `Failed to init dependencies for ${target.name}`,
                );
            }
        }
    };
}
