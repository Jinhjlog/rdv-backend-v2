# 1. 빌드 스테이지
FROM node:22-slim AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# Prisma 스키마 복사 및 클라이언트 생성
COPY prisma ./prisma
RUN npx prisma generate

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM node:22-slim

# OpenSSL 설치 (Prisma 필수)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# 런타임 의존성만 설치
COPY package*.json ./
RUN npm ci --omit=dev

# 빌드된 코드 및 Prisma 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
