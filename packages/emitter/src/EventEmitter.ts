import isEqual from 'lodash.isequal';

export type Callback<P> = (parameter: P) => any;

interface Listener<K, P> {
    id: number;
    key: K;
    callback: Callback<P>;
    context?: object;
}

export interface ListenerReference {
    remove: () => void;
}

export default class EventEmitter<E> {

    private listeners: Listener<keyof E, any>[] = [];
    private idGenerator = 0;

    on<K extends keyof E>(key: K, callback: Callback<E[K]>, context?: object): ListenerReference {
        // eslint-disable-next-line no-plusplus
        const id = ++this.idGenerator;
        this.listeners.push({
            id,
            key,
            callback,
            context,
        });
        return {
            remove: () => {
                this.removeListener(id);
            },
        };
    }

    removeListenerByCallback<K extends keyof E>(callback: Callback<E[K]>): void {
        const listener = this.listeners.find((l) => l.callback === callback);
        if (listener) {
            this.removeListener(listener.id);
        }
    }

    emit<K extends keyof E>(key: K, parameter: E[K]): Promise<PromiseSettledResult<any>[]> {
        const promises = this.listeners
            .filter((listener) => isEqual(key, listener.key))
            .map((listener) => listener.callback.call(listener.context, parameter));
        return Promise.allSettled(promises);
    }

    private removeListener(id: number): void {
        this.listeners = this.listeners.filter((listener) => listener.id !== id);
    }
}
