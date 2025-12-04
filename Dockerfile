FROM node:20-alpine

# Set working directory
WORKDIR /home/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run","dev"]
