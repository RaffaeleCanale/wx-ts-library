import { seconds } from '@canale/timer';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import ReconnectWebSocket from './ReconnectWebSocket.js';
import { WebSocketClosedError } from './WebSocketClosedError.js';

class FakeWs {
    static instances: FakeWs[] = [];

    constructor() {
        FakeWs.instances.push(this);
    }

    onopen?: () => {};
    onmessage?: (event: { data: string }) => {};
    onerror?: (error: Error) => {};
    onclose?: (event: { code: number; reason: string }) => {};

    close = vi.fn();
}

describe('ReconnectWebSocket', () => {
    let socket: ReconnectWebSocket;
    let onError: Mock;
    let onClose: Mock;
    let onConnect: Mock;
    let onMessage: Mock;

    beforeEach(() => {
        vi.useFakeTimers();

        onError = vi.fn();
        onClose = vi.fn();
        onConnect = vi.fn();
        onMessage = vi.fn();

        socket = new ReconnectWebSocket('', FakeWs, {
            reconnectDelay: seconds(10),
            maxRetries: 3,
        });
        socket.on('error', onError);
        socket.on('close', onClose);
        socket.on('connect', onConnect);
        socket.on('message', onMessage);

        FakeWs.instances = [];
    });

    function wsInstance() {
        if (FakeWs.instances.length !== 1) {
            throw new Error('Expected exactly one instance of FakeWs');
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return FakeWs.instances[0]!;
    }

    test('when socket successfully connects, it is connected', async () => {
        // WHEN
        const promise = socket.connect();
        wsInstance().onopen?.();
        await promise;

        // THEN
        expect(socket.getState()).toEqual('connected');
        expect(onConnect).toHaveBeenCalledTimes(1);
    });

    test('when socket is connected and a message is received, it emits the message', async () => {
        // GIVEN
        const promise = socket.connect();
        wsInstance().onopen?.();
        await promise;

        // WHEN
        wsInstance().onmessage?.({ data: '{ "hello": "world" }' });

        // THEN
        expect(onMessage).toHaveBeenCalledTimes(1);
        expect(onMessage).toHaveBeenCalledWith({ hello: 'world' });
    });

    test('when socket is connected and an error occurs, it emits the error', async () => {
        // GIVEN
        const promise = socket.connect();
        wsInstance().onopen?.();
        await promise;

        // WHEN
        wsInstance().onerror?.(new Error('Something went wrong'));

        // THEN
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(new Error('Something went wrong'));
        expect(onClose).toHaveBeenCalledTimes(0);
        expect(socket.getState()).toEqual('connected');
    });

    test('when socket fails to connect, it tries to reconnect', async () => {
        // GIVEN
        const promise = socket.connect();
        wsInstance().onerror?.(new Error('Something went wrong'));
        await promise;

        expect(socket.getState()).toEqual('reconnecting');
        FakeWs.instances = [];

        // WHEN
        vi.advanceTimersByTime(seconds(10));
        wsInstance().onopen?.();
        await new Promise<void>((resolve) => resolve());

        // THEN
        expect(socket.getState()).toEqual('connected');
    });

    test('when socket is connected and it is closed, it emits the close and tries to reconnect', async () => {
        // GIVEN
        const promise = socket.connect();
        wsInstance().onopen?.();
        await promise;

        // WHEN
        wsInstance().onclose?.({ code: 1001, reason: 'closure' });

        // THEN
        expect(onClose).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
            new WebSocketClosedError(1001, 'closure'),
        );
        expect(socket.getState()).toEqual('reconnecting');
        FakeWs.instances = [];

        // WHEN
        vi.advanceTimersByTime(seconds(10));
        wsInstance().onopen?.();
        await new Promise<void>((resolve) => resolve());

        // THEN
        expect(socket.getState()).toEqual('connected');
    });

    test('when too many reconnect failed, it stops trying to reconnect', async () => {
        // GIVEN
        const promise = socket.connect();
        wsInstance().onopen?.();
        await promise;

        // WHEN
        wsInstance().onclose?.({ code: 1001, reason: 'closure' }); // Failure 1
        await new Promise<void>((resolve) => resolve());
        FakeWs.instances = [];
        expect(socket.getState()).toEqual('reconnecting');
        expect(onClose).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(seconds(10));
        wsInstance().onclose?.({ code: 1001, reason: 'closure' }); // Failure 2
        await new Promise<void>((resolve) => resolve());
        FakeWs.instances = [];
        expect(socket.getState()).toEqual('reconnecting');
        expect(onClose).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(seconds(10));
        wsInstance().onclose?.({ code: 1001, reason: 'closure' }); // Failure 3
        await new Promise<void>((resolve) => resolve());
        FakeWs.instances = [];
        expect(socket.getState()).toEqual('reconnecting');
        expect(onClose).toHaveBeenCalledTimes(0);
        expect(onError).toHaveBeenCalledTimes(3);

        vi.advanceTimersByTime(seconds(10));
        wsInstance().onclose?.({ code: 1001, reason: 'closure' }); // Failure 4
        await new Promise<void>((resolve) => resolve());
        FakeWs.instances = [];
        expect(socket.getState()).toEqual('disconnected');
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(3);
    });

    test('when socket is connected and disconnect is called, it disconnects without retrying', async () => {});

    test('when socket is reconnecting and disconnect is called, it disconnects without retrying', async () => {});
});
