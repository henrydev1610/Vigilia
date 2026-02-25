FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash netcat-openbsd wget

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

EXPOSE 3333

ENTRYPOINT ["sh", "/app/scripts/entrypoint.sh"]
CMD ["npm", "run", "dev"]
