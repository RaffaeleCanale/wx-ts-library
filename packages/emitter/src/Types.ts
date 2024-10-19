export type ListenerCallback<P> = (parameter: P) => unknown;

export interface Listener<K, P> {
    id: number;
    key: K;
    callback: ListenerCallback<P>;
    context?: object;
}

export interface ListenerReference {
    remove: () => void;
}
