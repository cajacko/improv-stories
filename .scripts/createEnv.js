const { readFile, writeFile } = require("fs-extra");
const { join } = require("path");

const dirs = [
  join(__dirname, "../packages/web-app"),
  join(__dirname, "../packages/api"),
];

Promise.all(
  dirs.map((dir) =>
    readFile(join(dir, ".env")).then((content) => {
      const string = content.toString();

      const env = string
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" || line.startsWith("#"))
        .reduce((acc, line) => {
          const [key] = line.split("=");

          const value = process.env[key];

          if (!value) {
            throw new Error(`No env value for ${key}`);
          }

          return `${acc}\n${key}=${value}`;
        }, "");

      return Promise.all([
        writeFile(join(dir, ".env.production"), env),
        writeFile(join(dir, ".env.local"), env),
      ]);
    })
  )
).catch((error) => {
  console.error(error);
  process.exit(1);
});
