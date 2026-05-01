module.exports = {
  apps: [
    {
      name: "lms-internal",
      script: "server.ts",
      interpreter: "node_modules/.bin/tsx",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1, // Socket.io requires sticky sessions — keep at 1
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
