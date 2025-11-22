export interface IHealthCheckResponsePayload {
    status: 'ok' | 'degraded';
    environment: string;
    timeStamp: string;
}
