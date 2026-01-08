FROM node:22-alpine AS build

WORKDIR /app

# Kopiramo package datoteke ločeno, da izkoristimo Docker caching
COPY package*.json ./

# Namestimo odvisnosti (npm ci je boljši za build sisteme kot npm install)
RUN npm install

# Kopiramo preostalo kodo
COPY . .

# Zgradimo aplikacijo za produkcijo
RUN npm run build -- --configuration=production

# Uporabimo Nginx za serviranje statičnih datotek
FROM nginx:alpine

# Kopiramo našo Nginx konfiguracijo (glej spodaj)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiramo zgrajene datoteke iz prve faze
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
