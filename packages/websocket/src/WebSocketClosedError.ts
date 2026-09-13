export const WsErrorCodes = {
    BAD_GATEWAY: 1014,
    CLOSED_NO_STATUS: 1005,
    CLOSE_ABNORMAL: 1006,
    CLOSE_GOING_AWAY: 1001,
    CLOSE_NORMAL: 1000,
    CLOSE_PROTOCOL_ERROR: 1002,
    CLOSE_TOO_LARGE: 1009,
    CLOSE_UNSUPPORTED: 1003,
    MANDATORY_EXTENSION: 1010,
    POLICY_VIOLATION: 1008,
    SERVER_ERROR: 1011,
    SERVICE_RESTART: 1012,
    TLS_HANDSHAKE_FAIL: 1015,
    TRY_AGAIN_LATER: 1013,
    UNSUPPORTED_PAYLOAD: 1007,
} as const;

export class WebSocketClosedError extends Error {
    public readonly code: (typeof WsErrorCodes)[keyof typeof WsErrorCodes];
    public readonly reason: string;
    public readonly name: string = 'WebSocketClosedError';

    constructor(code: (typeof WsErrorCodes)[keyof typeof WsErrorCodes], reason: string) {
        super(`WebSocket closed with code ${String(code)} and reason: ${reason}`);
        this.code = code;
        this.reason = reason;
    }
}
