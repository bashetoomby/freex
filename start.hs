#!/bin/bash
# Запускаем бекенд и фронтенд в фоне
cd apps/backend && BACKEND_PORT=3001 npm run start:prod &
cd apps/frontend && PORT=3000 npm start &


sleep 15


node server.js