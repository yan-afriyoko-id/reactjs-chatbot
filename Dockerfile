FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV CI=true

EXPOSE 3000

# Bind CRA dev server to all interfaces
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["sh", "-c", "if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm start"]


