FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

CMD ["npm", "run", "web:docker"]
