import * as Sentry from "@sentry/node";

export default {
  log: (type: string, payload?: Sentry.Event["extra"]) => {
    if (process.env.NODE_ENV === "test") return;

    const name = `@SERVER/${type}:`;

    Sentry.captureEvent({
      message: name,
      extra: payload,
      level: Sentry.Severity.Debug,
    });

    if (payload === undefined) {
      console.log(name);
    } else {
      console.log(name, payload);
    }
  },
};
