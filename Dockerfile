# Koristi Node.js kao osnovni image
FROM node:16 as build

# Postavi radni direktorijum
WORKDIR /app

# Kopiraj package.json i package-lock.json fajlove u radni direktorijum
COPY package*.json ./

# Instaliraj zavisnosti
RUN npm install

# Kopiraj ostale fajlove u radni direktorijum
COPY . .

# Izgradi aplikaciju
RUN npm run build

# Koristi Nginx za posluživanje statičkog sadržaja
FROM nginx:alpine

# Kopiraj izgrađenu aplikaciju iz prethodnog stepa u Nginx direktorijum
COPY --from=build /app/build /usr/share/nginx/html

# Ekspoziraj port
EXPOSE 80

# Pokreni Nginx
CMD ["nginx", "-g", "daemon off;"]
