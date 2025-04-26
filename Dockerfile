# Dockerfile per applicazione Nuxt JWT Tutorial
# ------------------------------------------------------

# Fase di build dell'applicazione
FROM node:20-alpine AS build

# Impostazione directory di lavoro
WORKDIR /usr/src/app

# Installazione di pnpm (gestore pacchetti come da package.json)
RUN npm install -g pnpm@10.6.3

# Copia dei file di configurazione delle dipendenze
COPY package.json ./
COPY nuxt.config.ts ./

# Installazione delle dipendenze
RUN pnpm install

# Copia di tutti i file sorgente
COPY . .

# Build dell'applicazione
RUN pnpm build

# Fase di produzione
FROM node:20-alpine AS production

# Impostazione directory di lavoro
WORKDIR /usr/src/app

# Installazione di pnpm globalmente
RUN npm install -g pnpm@10.6.3

# Copia solo file necessari dal build stage
COPY --from=build /usr/src/app/.output /usr/src/app/.output
COPY --from=build /usr/src/app/package.json /usr/src/app/

# Esposizione porta 3000
EXPOSE 3000

# Variabili d'ambiente per la produzione (sostituibili a runtime)
ENV NODE_ENV=production

# Comando per avvio applicazione
CMD ["node", ".output/server/index.mjs"]

# Version: 1.0.0