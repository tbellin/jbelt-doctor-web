# JBelt Doctor Web - Environment Configuration Guide

## 📁 File .env Disponibili

### 1. `.env` (Default/Fallback)
- **Quando**: Configurazione base, fallback per tutte le situazioni
- **API**: `http://localhost:8080` (Spring Boot diretto)
- **Frontend**: `http://localhost:3000`
- **Database**: PostgreSQL con configurazione completa

### 2. `.env.development` (Mac Development)
- **Quando**: Sviluppo locale su Mac (atlante.local)
- **API**: `http://atlante.local:8080` (Spring Boot diretto)
- **Frontend**: `http://atlante.local:3000`
- **Debug**: Abilitato (`NUXT_DEBUG=true`)
- **Hot Reload**: Abilitato (`CHOKIDAR_USEPOLLING=true`)

### 3. `.env.production` (Production)
- **Quando**: Deployment produzione
- **API**: `http://localhost:80` (tramite nginx)
- **Frontend**: `http://jbelt.org:80`
- **Database**: PostgreSQL con password sicure
- **Debug**: Disabilitato

### 4. `.env.ubuntu` (Ubuntu/Plesk)
- **Quando**: Deployment su server Ubuntu/Plesk
- **API**: `https://jbelt.org` (SSL)
- **Frontend**: `https://jbelt.org`

## 🔧 Come Nuxt Seleziona il File .env

Nuxt.js carica i file .env in questo ordine:

1. `.env.{NODE_ENV}.local` (non presente)
2. `.env.local` (non presente)
3. `.env.{NODE_ENV}` ← **Questo è quello che usiamo**
4. `.env` (fallback)

### Esempi di Selezione

```bash
# Sviluppo Mac
NODE_ENV=development pnpm dev
# → Carica .env.development

# Produzione
NODE_ENV=production pnpm build
# → Carica .env.production

# Default
pnpm dev
# → Carica .env (fallback)
```

## 🚀 Configurazioni Raccomandate

### Sviluppo Locale (Mac)
```bash
# Imposta NODE_ENV
export NODE_ENV=development

# Avvia il server
pnpm dev

# Oppure direttamente
NODE_ENV=development pnpm dev
```

### Test API Backend
Prima di avviare il frontend, verifica che il backend sia accessibile:

```bash
# Spring Boot diretto
curl http://atlante.local:8080/management/health

# Login test
curl -X POST http://atlante.local:8080/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Docker Integrato
```bash
# Usa docker-compose.integrated.yml
make integrated

# Accessi:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/api
# Database: http://localhost:5432
```

## ⚠️ Problemi Comuni

### 1. API Non Raggiungibile
- **Problema**: Frontend non può accedere alle API
- **Soluzione**: Verifica che il backend Spring Boot sia attivo sulla porta corretta
- **Test**: `curl http://atlante.local:8080/management/health`

### 2. File .env Sbagliato
- **Problema**: Configurazione errata caricata
- **Soluzione**: Verifica `NODE_ENV` e assicurati che il file .env corretto esista
- **Debug**: Controlla le variabili con `console.log(process.env.NUXT_PUBLIC_API_BASE)`

### 3. CORS Errors
- **Problema**: Errori di CORS nelle API
- **Soluzione**: Verifica che il backend abbia configurato CORS per l'origine del frontend
- **File**: Controlla `.env` sezione `CORS_ALLOWED_ORIGINS`

## 🔍 Debug Configuration

Aggiungi al tuo componente Vue per debug:

```javascript
// components/DebugConfig.vue
export default {
  mounted() {
    console.log('API Base:', this.$config.public.apiBase)
    console.log('API Host:', this.$config.public.apiHost)
    console.log('Debug Mode:', this.$config.public.debug)
  }
}
```

## 📊 Variabili Chiave per Ambiente

| Variabile | Development | Production | Ubuntu |
|-----------|-------------|------------|---------|
| `NUXT_PUBLIC_API_BASE` | `http://atlante.local:8080` | `http://localhost:80` | `https://jbelt.org` |
| `NUXT_PUBLIC_API_PORT` | `8080` | `80` | `443` |
| `NUXT_DEBUG` | `true` | `false` | `false` |
| `NODE_ENV` | `development` | `production` | `production` |

## 📝 Best Practices

1. **Sempre verificare** che il backend sia attivo prima di avviare il frontend
2. **Usare NODE_ENV** per selezionare l'ambiente corretto
3. **Testare le API** con curl prima di debuggare il frontend
4. **Non committare** file .env.local se contengono dati sensibili
5. **Documentare** le modifiche alle configurazioni in questo file