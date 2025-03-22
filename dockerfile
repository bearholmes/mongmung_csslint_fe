FROM node:18-alpine AS builder
WORKDIR /app

# 종속성 먼저 설치 (캐싱 활용)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 소스 복사
COPY . .

# 메모리 제한 설정을 명시적으로 추가
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

FROM nginx:stable-alpine AS production
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
