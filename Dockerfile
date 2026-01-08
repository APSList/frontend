# --- 1. Faza: Gradnja (Build Stage) ---
FROM node:22-alpine AS build

WORKDIR /app

# Kopiramo package.json in package-lock.json
COPY package*.json ./

# SPREMEMBA: Uporabimo 'npm install' namesto 'npm ci'.
# To omogoča Dockerju, da sam razreši platformno specifične odvisnosti (npr. chokidar),
# in ignorira manjša neskladja v lock datoteki.
RUN npm install

# Kopiramo preostalo kodo
COPY . .

# Zgradimo aplikacijo za produkcijo
RUN npm run build -- --configuration=production

# --- 2. Faza: Strežnik (Serve Stage) ---
FROM nginx:alpine

# Kopiramo Nginx konfiguracijo
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiramo zgrajene datoteke.
# POZOR: Preveri, če je pot 'dist/frontend/browser' pravilna.
# Če se tvoj projekt ne imenuje 'frontend', zamenjaj 'frontend' s pravim imenom.
# Pri Angular 17+ je mapa 'browser' obvezna.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
