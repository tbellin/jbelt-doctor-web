# (Posizionato nella root del progetto)

# Usa un'immagine Node.js ufficiale recente (Alpine è più leggera)
FROM node:lts-alpine as base

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia prima i file di dipendenze dalla sottocartella 'app'
COPY ./package*.json ./
# Se usi pnpm: COPY app/package.json app/pnpm-lock.yaml ./
# Se usi yarn: COPY app/package.json app/yarn.lock ./

# Installa le dipendenze (usa la versione specificata nel lock file)
RUN npm install --frozen-lockfile
# Se usi pnpm: RUN npm install -g pnpm && pnpm install --frozen-lockfile
# Se usi yarn: RUN yarn install --frozen-lockfile

# Copia TUTTO il contenuto della directory 'app' locale nella WORKDIR del container
COPY ./ .

# Esponi la porta su cui Nuxt (Nitro) gira di default
EXPOSE 3000

# Comando di default per avviare l'app in modalità sviluppo usando il codice COPIATO nell'immagine
CMD ["npx", "nuxi", "dev", "--host", "0.0.0.0"]