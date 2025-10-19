interface TelemetryEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

class Telemetry {
  private events: TelemetryEvent[] = [];

  track(event: string, properties?: Record<string, unknown>) {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(telemetryEvent);

    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      console.log("[Telemetry]", telemetryEvent);
    }
  }

  pageView(page: string) {
    this.track("page_view", { page });
  }

  timeOnTask(task: string, duration: number) {
    this.track("time_on_task", { task, duration });
  }

  getEvents() {
    return this.events;
  }
}

export const telemetry = new Telemetry();
