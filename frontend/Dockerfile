# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY . .
# Use --legacy-peer-deps to bypass the error
RUN npm install --legacy-peer-deps && npm run build


# Serve Angular app
FROM nginx:alpine
COPY --from=build /app/dist/* /usr/share/nginx/html
