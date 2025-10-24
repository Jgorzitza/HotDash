interface TelemetryEvent {
    event: string;
    properties?: Record<string, any>;
    timestamp: number;
}
declare class Telemetry {
    private events;
    track(event: string, properties?: Record<string, any>): void;
    pageView(page: string): void;
    timeOnTask(task: string, duration: number): void;
    getEvents(): TelemetryEvent[];
}
export declare const telemetry: Telemetry;
export {};
//# sourceMappingURL=telemetry.d.ts.map