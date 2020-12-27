const WS_ERROR_CODES: { [code: number]: string } = {
    1000: 'CLOSE_NORMAL',
    1001: 'CLOSE_GOING_AWAY',
    1002: 'CLOSE_PROTOCOL_ERROR',
    1003: 'CLOSE_UNSUPPORTED',
    1005: 'CLOSED_NO_STATUS',
    1006: 'CLOSE_ABNORMAL',
    1007: 'UNSUPPORTED_PAYLOAD',
    1008: 'POLICY_VIOLATION',
    1009: 'CLOSE_TOO_LARGE',
    1010: 'MANDATORY_EXTENSION',
    1011: 'SERVER_ERROR',
    1012: 'SERVICE_RESTART',
    1013: 'TRY_AGAIN_LATER',
    1014: 'BAD_GATEWAY',
    1015: 'TLS_HANDSHAKE_FAIL',
};

export default class WebSocketClosedError extends Error {
    constructor(
        private readonly code: number,
        private readonly reason: string,
        private readonly cause?: Error,
    ) {
        super(`${reason}: ${WS_ERROR_CODES[code]}`);
    }
}
