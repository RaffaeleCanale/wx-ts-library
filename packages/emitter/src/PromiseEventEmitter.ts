import isEqual from 'lodash.isequal';
import type { Listener, ListenerCallback, ListenerReference } from './Types.js';

export default class PromiseEventEmitter<E> {
    private listeners: Listener<keyof E, unknown>[] = [];
    private idGenerator = 0;

    on<K extends keyof E>(
        key: K,
        callback: ListenerCallback<E[K]>,
        context?: object,
    ): ListenerReference {
        const id = ++this.idGenerator;
        this.listeners.push({
            id,
            key,
            callback: callback as ListenerCallback<unknown>,
            context,
        });
        return {
            remove: () => {
                this.removeListener(id);
            },
        };
    }

    off<K extends keyof E>(callback: ListenerCallback<E[K]>): void {
        const listener = this.listeners.find((l) => l.callback === callback);
        if (listener) {
            this.removeListener(listener.id);
        }
    }

    emit<K extends keyof E>(
        key: K,
        parameter: E[K],
    ): Promise<PromiseSettledResult<unknown>[]> {
        const promises = this.listeners
            .filter((listener) => isEqual(key, listener.key))
            .map((listener) =>
                listener.callback.call(listener.context, parameter),
            );
        return Promise.allSettled(promises);
    }

    private removeListener(id: number): void {
        this.listeners = this.listeners.filter(
            (listener) => listener.id !== id,
        );
    }
}
