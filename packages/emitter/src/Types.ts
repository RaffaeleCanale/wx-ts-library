export type ListenerCallback<P> = (parameter: P) => unknown;

export type Listener<K, P> = {
    id: number;
    key: K;
    callback: ListenerCallback<P>;
    context?: object;
};

export type ListenerReference = {
    remove: () => void;
};
