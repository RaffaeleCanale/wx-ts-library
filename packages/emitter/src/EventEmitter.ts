import isEqual from 'lodash.isequal';

type callback = (parameter?: any) => PromiseLike<void> | void;

interface Listener<K> {
    id: number;
    key: K;
    callback: callback;
    context?: object;
}

interface ListenerReference {
    remove: () => void;
}

export default class EventEmitter<K> {

    private listeners: Listener<K>[] = [];
    private idGenerator = 0;

    on(key: K, callback: callback, context?: object): ListenerReference {
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

    emit(key: K, parameter?: any): Promise<PromiseSettledResult<any>[]> {
        const promises = this.listeners
            .filter((listener) => isEqual(key, listener.key))
            .map((listener) => listener.callback.call(listener.context, parameter));
        return Promise.allSettled(promises);
    }

    private removeListener(id: number): void {
        this.listeners = this.listeners.filter((listener) => listener.id !== id);
    }
}
