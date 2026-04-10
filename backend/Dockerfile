FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/.env.example ./.env.example

# Copy frontend files to serve statically
COPY index.html ./public/
COPY styles.css ./public/
COPY script.js ./public/

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/medcore_hms
ENV FRONTEND_ORIGIN=http://localhost:4000

EXPOSE 4000

CMD ["sh", "-c", "node src/db/initDb.js && node src/server.js"]
