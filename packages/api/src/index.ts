import "./env";
import * as express from "express";
import * as socket from "socket.io";
import { Server } from "http";
import logger from "./logger";
import setupSockets from "./setupSockets";
import { join } from "path";

const PORT = process.env.PORT || 8080;

const app = express();
const server = new Server(app);
const io = socket(server);

function cleanUp(err: Error) {
  logger.log("cleanUp - closing server");
  server.close();
  console.log(err);
  process.exit(1);
}

process.on("uncaughtException", cleanUp);
process.on("SIGTERM", () => cleanUp(new Error("SIGTERM")));

setupSockets(io);

app.use(express.static(join(__dirname, "../../web-app/build")));
app.use((req, res) =>
  res.sendFile(join(__dirname, "../../web-app/build/index.html"))
);

server.listen(PORT, () => {
  logger.log(`listen - listening on ${PORT}`);
});
