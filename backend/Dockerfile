FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 10000

CMD ["npm", "run", "start"]
