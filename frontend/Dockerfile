# frontend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Открываем порт для dev сервера
EXPOSE 5173

# Запускаем dev режим с хостом 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]