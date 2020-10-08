FROM node:12.18-alpine as base
EXPOSE 3000
ENV NODE_ENV production
WORKDIR /app
COPY package*.json ./
RUN npm ci \
    && npm cache clean --force
COPY . .
USER node
CMD ["node", "app.js"]

# Build your Docker image
# docker build -t express-api:1.0.0 .

# Run your Docker image and pass configuration file
# docker run --init -p 3000:3000 --env-file=.env.development express-api:1.0.0