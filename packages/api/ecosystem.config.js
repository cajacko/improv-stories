module.exports = {
  apps: [
    {
      name: "api",
      script: "./dist/index.js",
      time: true,
      kill_timeout: 3000,
      restart_delay: 1000,
      force: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
