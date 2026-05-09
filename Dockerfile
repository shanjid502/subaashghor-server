# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# If you have other assets like email templates, copy them here
# COPY --from=build /app/src/assets ./dist/assets

EXPOSE 5000
CMD ["npm", "run", "start:prod"]
