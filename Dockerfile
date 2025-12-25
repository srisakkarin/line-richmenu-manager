# ---------- Build Stage ----------
    FROM node:24-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    COPY .env .env 
    RUN npm ci
    
    COPY . .
    
    RUN npm run build
    
    # ---------- Run Stage ----------
    FROM node:24-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=11210
    
    RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
    
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    USER nextjs
    
    EXPOSE 11210
    
    CMD ["node", "server.js"]
    