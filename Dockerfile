FROM node:20-alpine AS builder

ENV NODE_ENV production
WORKDIR /app

COPY package.json package-lock.json .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY public public
COPY src src

RUN npm ci
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
