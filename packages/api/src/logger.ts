import * as Sentry from "@sentry/node";

export default {
  log: (type: string, payload?: Sentry.Event["extra"]) => {
    if (process.env.NODE_ENV === "test") return;

    const m = new Date();
    var dateString =
      m.getUTCFullYear() +
      "/" +
      ("0" + (m.getUTCMonth() + 1)).slice(-2) +
      "/" +
      ("0" + m.getUTCDate()).slice(-2) +
      " " +
      ("0" + m.getUTCHours()).slice(-2) +
      ":" +
      ("0" + m.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + m.getUTCSeconds()).slice(-2);

    const name = `${dateString} @SERVER/${type}:`;

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
