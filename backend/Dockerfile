FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash netcat-openbsd wget postgresql-client

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install; fi

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 3334

ENTRYPOINT ["sh", "/app/scripts/entrypoint.sh"]
CMD ["npm", "run", "start"]
