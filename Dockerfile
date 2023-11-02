FROM node:20-alpine AS builder

ENV NODE_ENV production
WORKDIR /app

COPY package.json package-lock.json ./
COPY tailwind.config.js .
COPY tsconfig.json .
COPY public public
COPY src src

RUN npm ci --ignore-scripts
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.24.0-alpine3.18

COPY --from=builder /app/build /html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
