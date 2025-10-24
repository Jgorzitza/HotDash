class Telemetry {
    events = [];
    track(event, properties) {
        const telemetryEvent = {
            event,
            properties,
            timestamp: Date.now(),
        };
        this.events.push(telemetryEvent);
        if (typeof window !== "undefined" &&
            process.env.NODE_ENV === "production") {
            console.log("[Telemetry]", telemetryEvent);
        }
    }
    pageView(page) {
        this.track("page_view", { page });
    }
    timeOnTask(task, duration) {
        this.track("time_on_task", { task, duration });
    }
    getEvents() {
        return this.events;
    }
}
export const telemetry = new Telemetry();
//# sourceMappingURL=telemetry.js.map