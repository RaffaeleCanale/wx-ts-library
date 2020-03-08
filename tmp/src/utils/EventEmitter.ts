import isEqual from 'lodash/isEqual';

function triggerListener<K>(listener: Listener<K>, parameter?: any): PromiseLike<void> | void {
    return listener.callback.apply(listener.context, parameter);
}

type callback = (parameter?: any) => PromiseLike<void> | void;

interface Listener<K> {
    id: K;
    callback: callback;
    context?: object;
}

export default class EventEmitter<K> {

    protected listeners: Listener<K>[] = [];

    on(id: K, callback: callback, context?: object): void {
        this.listeners.push({ id, callback, context });
    }

    emit(id: K, parameter?: any): Promise<PromiseSettledResult<any>[]> {
        const promises = this.listeners
            .filter((listener) => isEqual(id, listener.id))
            .map((listener) => triggerListener(listener, parameter));
        return Promise.allSettled(promises);
    }

    off(callback: (parameter: any) => any): void {
        this.listeners = this.listeners.filter((l): boolean => l.callback === callback);
    }

}
