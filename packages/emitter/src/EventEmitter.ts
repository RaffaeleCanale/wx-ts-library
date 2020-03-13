import isEqual from 'lodash.isequal';

type callback<P> = (parameter: P) => PromiseLike<void> | void;

interface Listener<Events, K extends keyof Events> {
    id: number;
    key: K;
    callback: callback<Events[K]>;
    context?: object;
}

interface ListenerReference {
    remove: () => void;
}

export default class EventEmitter<Events> {

    private listeners: Listener<Events, any>[] = [];
    private idGenerator = 0;

    on<K extends keyof Events>(key: K, callback: callback<Events[K]>, context?: object): ListenerReference {
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

    emit<K extends keyof Events>(key: K, parameter: Events[K]): Promise<PromiseSettledResult<any>[]> {
        const promises = this.listeners
            .filter((listener) => isEqual(key, listener.key))
            .map((listener) => listener.callback.call(listener.context, parameter));
        return Promise.allSettled(promises);
    }

    private removeListener(id: number): void {
        this.listeners = this.listeners.filter((listener) => listener.id !== id);
    }
}
