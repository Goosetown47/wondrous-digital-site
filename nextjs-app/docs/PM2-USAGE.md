# PM2 Usage Guide for Next.js Development

## Overview
PM2 is managing the Next.js development server as a background process. This allows you to run the server without keeping a terminal window open.

## Quick Commands

### Check Status
```bash
npm run pm2:status
# or
pm2 status
```

### View Logs (Real-time)
```bash
npm run pm2:logs
# or
pm2 logs nextjs-dev --lines 50
```

### Restart Server (after code changes)
```bash
npm run pm2:restart
# or
pm2 restart nextjs-dev
```

### Stop Server
```bash
npm run pm2:stop
# or
pm2 stop nextjs-dev
```

### Start Server (if stopped)
```bash
npm run pm2:start
# or
pm2 start nextjs-dev
```

### Delete Process (complete removal)
```bash
npm run pm2:delete
# or
pm2 delete nextjs-dev
```

## Accessing the Application
- Local: http://localhost:3000
- The server is already running and ready to use

## Debugging with PM2

### View Error Logs
```bash
pm2 logs nextjs-dev --err
```

### View Output Logs
```bash
pm2 logs nextjs-dev --out
```

### Monitor CPU/Memory
```bash
pm2 monit
```

### View Process Info
```bash
pm2 info nextjs-dev
```

## Log File Locations
- Output logs: `~/.pm2/logs/nextjs-dev-out.log`
- Error logs: `~/.pm2/logs/nextjs-dev-error.log`

## Troubleshooting

### Server not responding
1. Check status: `pm2 status`
2. Check logs: `pm2 logs nextjs-dev`
3. Restart: `pm2 restart nextjs-dev`

### Port already in use
1. Check what's using the port: `lsof -i :3000`
2. Restart PM2 process: `pm2 restart nextjs-dev`

### Process keeps restarting
1. Check error logs: `pm2 logs nextjs-dev --err`
2. Check if build cache is corrupted: `rm -rf .next && pm2 restart nextjs-dev`

## Notes
- PM2 will automatically restart the process if it crashes
- Logs are persisted even after restart
- The process runs in the background, so you can close your terminal
- Use `pm2 save` to save the current process list
- Use `pm2 startup` to auto-start PM2 on system boot