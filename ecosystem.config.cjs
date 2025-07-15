module.exports = {
  apps: [{
    name: 'wondrous-dev',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    watch: false,
    env: {
      NODE_ENV: 'development'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 1000
  }]
};