# ---------- Build Stage ----------
FROM node:24-alpine AS builder

# 1. ติดตั้ง libc6-compat แก้ปัญหา process ค้างตอน build บน alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy เฉพาะไฟล์ package เพื่อ install dependency ก่อน (ช่วยเรื่อง Cache)
COPY package*.json ./
# ถ้ามี package-lock.json ให้ copy ด้วยเพื่อให้ version ตรงกัน
COPY package-lock.json ./ 

# ใช้ npm ci เพื่อความรวดเร็วและแน่นอน
RUN npm ci

# Copy โค้ดส่วนที่เหลือ
COPY . .
# Copy env ถ้าจำเป็น (แต่ปกติควรกำหนดที่ runtime หรือ docker-compose)
# COPY .env .env 

# สั่ง Build (ต้องแก้ next.config.ts ก่อนนะ)
RUN npm run build

# ---------- Run Stage ----------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=11210

# สร้าง user เพื่อความปลอดภัย
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy ไฟล์ที่จำเป็นสำหรับ Standalone mode
COPY --from=builder /app/public ./public
# สร้างโฟลเดอร์ .next เพื่อกัน error เรื่อง permission
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 11210

CMD ["node", "server.js"]