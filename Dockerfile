FROM node:20-alpine AS builder

RUN apk add --update git

ENV NODE_ENV=production
WORKDIR /app

# Copy the .git folder so we can get the last commit hash
COPY .git .git
COPY public public
COPY src src
COPY types types
COPY index.html .

COPY package.json package-lock.json .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY .env.production .
COPY vite-env.d.ts vite.config.ts .

RUN npm ci --ignore-scripts --include=dev
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --from=builder /app/build /html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
