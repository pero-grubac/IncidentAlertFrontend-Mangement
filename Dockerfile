# syntax=docker/dockerfile:1

# ---- Build the static site ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Vite bakes these into the bundle at build time.
ARG VITE_API_URL=http://localhost:5002
ARG VITE_ML_URL=http://localhost:5004
ARG VITE_STATISTICS_URL=http://localhost:5006
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GOOGLE_API_KEY=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_ML_URL=$VITE_ML_URL \
    VITE_STATISTICS_URL=$VITE_STATISTICS_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY
RUN npm run build

# ---- Serve it with nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
