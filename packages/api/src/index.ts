import "./env";
import * as express from "express";
import * as socket from "socket.io";
import { Server } from "http";
import logger from "./logger";
import setupSockets from "./setupSockets";
import { join } from "path";
import * as Sentry from "@sentry/node";

const PORT = process.env.PORT || 8080;

const app = express();

Sentry.init({ dsn: process.env.SENTRY_DSN });

const server = new Server(app);
const io = socket(server);

function cleanUp(err: Error) {
  logger.log("cleanUp - closing server", err);
  server.close();
  console.log(err);
  process.exit(1);
}

process.on("uncaughtException", cleanUp);
process.on("SIGTERM", () => cleanUp(new Error("SIGTERM")));

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());
app.use(express.static(join(__dirname, "../../web-app/build")));
app.use((req, res) =>
  res.sendFile(join(__dirname, "../../web-app/build/index.html"))
);

setupSockets(io);

server.listen(PORT, () => {
  logger.log(`listen - listening on ${PORT}`);
});
