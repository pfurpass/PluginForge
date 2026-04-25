# ============ Build stage ============
FROM node:20-alpine AS build

WORKDIR /app

# Cache deps separately from source for fast iterations
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# In docker we serve via nginx + reverse-proxy /build → backend, so the
# frontend talks to the same origin. Empty string makes the runtime use
# relative URLs (e.g. fetch("/build")).
ENV VITE_BACKEND_URL=""
RUN npm run build

# ============ Serve stage ============
FROM nginx:1.27-alpine AS runtime

# Drop default nginx site
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/pluginforge.conf

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
