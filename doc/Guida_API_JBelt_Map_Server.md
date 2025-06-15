# Guida alle API JBelt Map Server

**Progetto:** jbeltMapSrv  
**Framework:** JHipster 8.11.0  
**Autenticazione:** JWT  
**Base URL:** http://jbelt.org:8080

## 🔐 Autenticazione

### Login
```http
POST /api/authenticate
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Risposta:**
```json
{
  "id_token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

### Utilizzo del token
Includere l'header Authorization in tutte le richieste successive:
```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## 📋 API Entità Principali

### 🏷️ Item API
```http
# Lista tutti gli items
GET /api/items

# Crea nuovo item
POST /api/items
{
  "itemCode": "ITM001",
  "itemName": "Componente Base",
  "itemActive": true,
  "code": "CB001",
  "active": true
}

# Aggiorna item
PUT /api/items/{id}

# Elimina item
DELETE /api/items/{id}
```

### 🔧 Model API
```http
# Lista tutti i modelli
GET /api/models

# Filtra per tipo
GET /api/models?modelType.equals=PART

# Crea nuovo modello
POST /api/models
{
  "code": "MDL001",
  "name": "Modello Principale",
  "modelType": "PART",
  "instanceType": "PARAMETRIC"
}
```

### 📄 Sheet API
```http
# Lista tutti i fogli
GET /api/sheets

# Crea nuovo foglio
POST /api/sheets
{
  "creoId": "SHEET_001",
  "code": "SH001",
  "name": "Foglio Principale",
  "formatType": "A3V"
}
```

## 🔍 Ricerca e Filtri

### Elasticsearch Search
```http
# Ricerca globale
GET /api/_search/models?query=componente

# Ricerca in items
GET /api/_search/items?query=attivo
```

### Filtri avanzati
```http
# Filtra modelli per tipo e stato
GET /api/models?modelType.equals=ASSEMBLY&active.equals=true

# Filtra per data
GET /api/model-versions?createdAt.greaterThan=2024-01-01T00:00:00Z
```

## 📊 Entità Relazionate

### Attributi di un Modello
```http
# Ottieni attributi di un modello specifico
GET /api/attribute-entities?model.id.equals={modelId}

# Crea attributo per modello
POST /api/attribute-entities
{
  "creoId": "ATTR_001",
  "code": "MATERIAL",
  "name": "Materiale",
  "typeValue": "STRING",
  "attributeValue": "Acciaio INOX",
  "category": "MATERIAL"
}
```

### Note e Balloon
```http
# Note di un balloon
GET /api/notes?baloon.id.equals={baloonId}

# Balloon di un foglio
GET /api/baloons?sheet.id.equals={sheetId}
```

## 📈 Tracking e Monitoring

### Tracker API
```http
# Lista processi in corso
GET /api/trackers?status.equals=IN_PROGRESS

# Crea nuovo tracker
POST /api/trackers
{
  "name": "Processo Assemblaggio",
  "description": "Tracciamento assemblaggio componenti",
  "modelId": "MDL001",
  "processId": "PROC_001",
  "processName": "Assemblaggio Principale",
  "status": "STARTED"
}
```

## 📝 Content Management

### Post e Articoli
```http
# Articoli pubblicati
GET /api/posts?publishedAt.specified=true

# Crea nuovo post
POST /api/posts
{
  "title": "Aggiornamento Modello",
  "subTitle": "Nuova versione disponibile",
  "content": "Contenuto dettagliato...",
  "publishedAt": "2024-06-15T10:00:00Z"
}
```

## 🗂️ Archive e File Management

### Gestione Files
```http
# Lista archivi
GET /api/archives

# Upload file
POST /api/archives
Content-Type: multipart/form-data

{
  "code": "FILE_001",
  "name": "Modello CAD",
  "type": "CAD",
  "category": "MODELS",
  "fileName": "componente.prt",
  "extension": "prt",
  "folder": "/models/parts/",
  "content": [binary data]
}
```

## 🔧 Utilità e Paginazione

### Paginazione
```http
# Pagina 2, 20 elementi per pagina
GET /api/models?page=1&size=20&sort=name,asc
```

### Parametri comuni
- `page`: numero pagina (0-based)
- `size`: elementi per pagina
- `sort`: campo,direzione (asc/desc)

## 📋 Enum Values

### ModelType
- `PART`: Parte singola
- `ASSEMBLY`: Assemblaggio  
- `DRAWING`: Disegno
- `FORMAT`: Formato

### InstanceType
- `PARAMETRIC`: Parametrico
- `NORMAL`: Normale
- `GENERIC`: Generico
- `INSTANCE`: Istanza
- `BULK`: Bulk

### DIN Formats
- `A0`, `A1`, `A2`, `A3V`, `A3O`, `A4V`, `A4O`

### TypeValue
- `STRING`, `INTEGER`, `DOUBLE`, `BOOLEAN`, `DATE`, `CONTENT`, `URL`

## 🛡️ Sicurezza e Autorizzazioni

Le API utilizzano autenticazione JWT. Assicurati di:
1. Effettuare login per ottenere il token
2. Includere il token in ogni richiesta
3. Rinnovare il token prima della scadenza

## 🚀 Esempi Pratici

### Workflow Completo: Creazione Modello con Attributi
```javascript
// 1. Login
const loginResponse = await fetch('/api/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin' })
});
const { id_token } = await loginResponse.json();

// 2. Crea Item
const item = await fetch('/api/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${id_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemCode: 'ITM001',
    itemName: 'Componente Base',
    itemActive: true
  })
});

// 3. Crea Modello
const model = await fetch('/api/models', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${id_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'MDL001',
    name: 'Modello Principale',
    modelType: 'PART',
    instanceType: 'PARAMETRIC'
  })
});
```

---
**Versione:** 1.0.0  
**Data:** 15 Giugno 2025  
**Compatibilità:** JHipster 8.11.0, Spring Boot 3.x