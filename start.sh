#!/bin/bash
cd ~/task-manager-api/backend
nohup npm run dev > ~/task-manager-api/backend/server.log 2>&1 &
echo "Server started in background. Logs: backend/server.log"
