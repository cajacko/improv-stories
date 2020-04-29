import "./env";
import * as express from "express";
import * as socket from "socket.io";
import logger from "./logger";
import setupSockets from "./setupSockets";

const { createServer } = require("http");
const kill = require("kill-port");

const PORT = process.env.PORT || 8080;

const app = express();
const http = createServer(app);
const io = socket(http);

setupSockets(io);

app.get("*", (req, res) => {
  res.json({
    online: true,
  });
});

kill(PORT, "tcp")
  .catch()
  .then(() => {
    http.listen(PORT, () => {
      logger.log(`listening on *:${PORT}`);
    });
  });
