# 🐛 Guida all'Uso del Pannello Debug

## 📋 **Panoramica**

Il pannello debug è uno strumento avanzato per documentare e analizzare le chiamate API, specificamente progettato per identificare problemi di perdita dati nelle operazioni Sheet/Model.

## 🚀 **Attivazione**

```bash
# Imposta la variabile di debug
export NUXT_DEBUG=true

# Oppure nel file .env
NUXT_DEBUG=true

# Riavvia il server
pnpm dev
```

Una volta attivo, il pannello debug appare in basso a destra su tutte le pagine.

## 🔍 **Funzionalità Principali**

### **1. Statistiche Real-time**
- **Totale API**: Numero totale di chiamate registrate
- **Operazioni Fogli**: Contatore specifico per `/api/sheets`
- **Perdita ModelIds**: Numero di volte che modelIds viene inviato ma models torna vuoto
- **Perdita DrawingId**: Numero di volte che drawingId viene inviato ma drawing torna null

### **2. Dettagli per Chiamata**
Ogni log entry mostra:
- Metodo HTTP (GET, POST, PUT, DELETE)
- URL della chiamata (versione accorciata)
- Durata in millisecondi
- Badge SHEET/MODEL per identificare il tipo di operazione
- Timestamp preciso
- Pulsante export individuale

### **3. Analisi Automatica**
Per le operazioni su fogli, il sistema analizza automaticamente:
- Presenza di `modelIds` nella request
- Presenza di `models` nella response
- Presenza di `drawingId` nella request
- Presenza di `drawing` nella response
- **Indicatori di perdita dati** quando i campi vengono inviati ma non ricevuti

## 📤 **Funzioni di Export**

### **Export Tutti i Log**
```javascript
// Esporta tutti i log in un file JSON
// Nome file: api-logs-YYYY-MM-DDTHH-mm-ss.json
```

### **Export Filtrato per Operazioni**
```javascript
// Solo operazioni fogli
// Nome file: api-logs-sheets-YYYY-MM-DDTHH-mm-ss.json

// Solo operazioni modelli  
// Nome file: api-logs-models-YYYY-MM-DDTHH-mm-ss.json
```

### **Report Completo**
```javascript
// Genera un report strutturato con:
// - Statistiche generali
// - Analisi automatica dei problemi
// - Log dettagliati separati per tipo
// - Indicatori di perdita dati
// Nome file: api-debug-report-YYYY-MM-DDTHH-mm-ss.json
```

### **Export Singolo**
```javascript
// Esporta specifico log entry
// Nome file: api-log-{ID}-YYYY-MM-DDTHH-mm-ss.json
```

## 🎯 **Caso d'Uso: Documentare Perdita Dati**

### **Scenario Tipico**
1. **Crea un nuovo foglio** con associazioni modelli
2. **Osserva il pannello debug** - vedrai l'indicatore di perdita dati
3. **Esporta il report completo** per documentare il problema
4. **Condividi il file JSON** con il team backend

### **Esempio di Perdita Dati**
```json
{
  "analysis": {
    "sheetDataLossIssues": 2,
    "drawingDataLossIssues": 1
  },
  "detailedLogs": {
    "sheetOperations": [
      {
        "requestData": {
          "modelIds": [1103, 1104],
          "drawingId": 1101
        },
        "responseData": {
          "models": [],        // ❌ PERDITA!
          "drawing": null      // ❌ PERDITA!
        },
        "dataLoss": {
          "modelIds": true,
          "drawingId": true
        }
      }
    ]
  }
}
```

## 🛠️ **Troubleshooting**

### **Pannello Non Visibile**
- Verifica che `NUXT_DEBUG=true` sia impostato
- Controlla la console browser per errori
- Riavvia il server di sviluppo

### **Nessun Log Registrato**
- Assicurati di aver fatto almeno una chiamata API
- Il pannello registra automaticamente tutte le chiamate quando attivo
- Controlla che le chiamate vengano effettivamente eseguite

### **Export Non Funziona**
- Verifica che il browser permetta i download
- Controlla che non ci siano popup blocker attivi
- Prova con un browser diverso

## 🎨 **Indicatori Visivi**

| Colore | Significato |
|--------|-------------|
| 🟢 Verde | Chiamata riuscita |
| 🔴 Rosso | Chiamata fallita |
| 🟡 Giallo | Badge SHEET |
| 🔵 Blu | Badge MODEL |
| ❌ Rosso | Perdita dati |
| ✅ Verde | Dati presenti |

## 📋 **Best Practices**

1. **Attiva debug solo in sviluppo** - mai in produzione
2. **Esporta i log regolarmente** per evitare perdita dati
3. **Usa il Report Completo** per documentazione formale
4. **Pulisci i log periodicamente** per performance migliori
5. **Condividi i file JSON** con dettagli specifici del problema

Il pannello debug è il tuo strumento principale per identificare e documentare i problemi di integrazione frontend-backend!