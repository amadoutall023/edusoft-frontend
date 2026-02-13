FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN rm -rf src/public

EXPOSE 3000
CMD ["npm", "run", "dev"]
