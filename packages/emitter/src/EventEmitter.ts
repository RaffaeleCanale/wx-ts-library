import isEqual from 'lodash.isequal';
import { Listener, ListenerCallback, ListenerReference } from './Types';

export default class EventEmitter<E> {

    private listeners: Listener<keyof E, any>[] = [];
    private idGenerator = 0;

    on<K extends keyof E>(
        key: K,
        callback: ListenerCallback<E[K]
    >, context?: object): ListenerReference {
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

    off<K extends keyof E>(callback: ListenerCallback<E[K]>): void {
        const listener = this.listeners.find((l) => l.callback === callback);
        if (listener) {
            this.removeListener(listener.id);
        }
    }

    emit<K extends keyof E>(key: K, parameter: E[K]): void {
        this.listeners
            .filter((listener) => isEqual(key, listener.key))
            .forEach((listener) => listener.callback.call(listener.context, parameter));
    }

    private removeListener(id: number): void {
        this.listeners = this.listeners.filter((listener) => listener.id !== id);
    }
}
