# Этап 1: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап 2: Раздача
FROM nginx:alpine
# Копируем билд из первого этапа в стандартную папку nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx (создадим его ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]