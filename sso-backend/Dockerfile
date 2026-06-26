FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY dist ./dist
COPY data ./data
COPY .env.production ./.env
EXPOSE 3000
CMD ["node", "dist/index.js"]
