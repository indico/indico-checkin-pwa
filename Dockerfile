FROM node:20-alpine AS builder

RUN apk add --update git

ENV NODE_ENV production
WORKDIR /app

COPY .git .git
COPY package.json package-lock.json ./
COPY tailwind.config.js .
COPY tsconfig.json .
COPY .env.production .
COPY public public
COPY src src
COPY types types

RUN npm ci --ignore-scripts
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --from=builder /app/build /html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
