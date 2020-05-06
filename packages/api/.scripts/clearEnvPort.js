require("dotenv-flow").config({
  node_env: process.env.NODE_ENV || "development",
});

const { exec } = require("child_process");

var net = require("net");

setInterval(() => {
  console.log("CHECKING PORT");
  var tester = net
    .createServer()
    .once("error", function (err) {
      if (err.code != "EADDRINUSE") {
        console.log("ERROR");
        return;
      }

      console.log("IN USE");
      exec("lsof -ti:4000 | xargs kill");
    })
    .once("listening", function () {
      tester
        .once("close", function () {
          console.log("NOT IN USE");
          process.exit(0);
        })
        .close();
    })
    .listen(process.env.PORT);
}, 1000);
