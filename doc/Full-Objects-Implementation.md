# 🔄 Implementazione Oggetti Completi - Frontend

## 📋 **Panoramica delle Modifiche**

Il frontend è stato modificato per inviare **oggetti completi** invece di solo ID, in risposta al problema di perdita dati identificato nel backend.

## 🎯 **Problema Risolto**

### **❌ Prima (non funzionava):**
```json
{
  "code": "s003",
  "name": "Foglio 003",
  "modelIds": [1103, 1104],    // Solo IDs
  "drawingId": 1101            // Solo ID
}
```

### **✅ Ora (dovrebbe funzionare):**
```json
{
  "code": "s003", 
  "name": "Foglio 003",
  "models": [                  // Oggetti completi
    {
      "id": 1103,
      "code": "M001",
      "name": "Modello 1",
      "modelType": "PART",
      "instanceType": "NORMAL"
    }
  ],
  "drawing": {                 // Oggetto completo
    "id": 1101,
    "name": "Disegno 02", 
    "modelType": "DRAWING"
  }
}
```

## 📁 **File Modificati**

### **1. ModelSheetsManager.vue**
**Percorso**: `app/components/Models/ModelSheetsManager.vue`

**Modifiche principali:**
- `handleAddSheets()`: Ora invia `models: [oggetti]` invece di `modelIds: [IDs]`
- `confirmRemoveAssociation()`: Ora gestisce rimozione con oggetti completi
- Evita referenze circolari impostando `sheets: []` negli oggetti Model

**Codice chiave:**
```javascript
// Crea l'oggetto modello completo da aggiungere
const modelToAdd = {
  id: props.model.id,
  code: props.model.code,
  name: props.model.name,
  modelType: props.model.modelType,
  // ... altri campi
  sheets: [] // Evita referenze circolari
}

const updateResponse = await sheetsApi.update(sheetId, {
  models: updatedModels  // Oggetti completi
})
```

### **2. Sheet Index Page**
**Percorso**: `app/pages/dashboard/sheets/index.vue`

**Modifiche principali:**
- `saveSheet()`: Converte IDs in oggetti completi prima dell'invio
- Mapping da `formData.modelIds` → `sheetData.models` (oggetti)
- Mapping da `formData.drawingId` → `sheetData.drawing` (oggetto)

**Codice chiave:**
```javascript
// Gestione modelli - converte IDs in oggetti completi
if (formData.value.modelIds.length > 0) {
  const selectedModels = formData.value.modelIds
    .map(id => availableModels.value.find(model => model.id?.toString() === id))
    .filter(Boolean)
    .map(model => ({
      id: model!.id,
      code: model!.code,
      name: model!.name,
      // ... altri campi
      sheets: [] // Evita referenze circolari
    }))
  
  sheetData.models = selectedModels
}

// Gestione drawing - converte ID in oggetto completo  
if (formData.value.drawingId) {
  const selectedDrawing = availableDrawings.value.find(
    drawing => drawing.id?.toString() === formData.value.drawingId
  )
  
  if (selectedDrawing) {
    sheetData.drawing = {
      id: selectedDrawing.id,
      code: selectedDrawing.code,
      name: selectedDrawing.name,
      // ... altri campi
      sheets: [] // Evita referenze circolari
    }
  }
}
```

### **3. Debug Panel Enhancement**
**Percorso**: `app/components/Debug/ApiDebugPanel.vue`

**Modifiche principali:**
- Analisi sia per `models/modelIds` che per `drawing/drawingId`
- Indicatori visivi per distinguere oggetti completi vs solo ID
- Confronto migliorato Request → Response

**Indicatori:**
- ✅ **Verde**: Oggetti completi inviati
- ⚠️ **Giallo**: Solo IDs inviati (vecchio formato)
- ⚪ **Grigio**: Non impostato

### **4. Debug Composable Update**
**Percorso**: `app/composables/useDebug.ts`

**Modifiche principali:**
- Funzioni helper `getRequestModelsCount()` e `hasRequestDrawing()`
- Supporto per entrambi i formati (ID e oggetti) nell'analisi
- Report summary aggiornato con nuovi indicatori

## 🔍 **Testing e Verifica**

### **Come Testare:**
1. Attiva debug mode: `NUXT_DEBUG=true`
2. Vai alla pagina Models
3. Aggiungi un foglio a un modello PART/ASSEMBLY
4. Controlla il debug panel per vedere:
   - ✅ **"Oggetti completi"** invece di ⚠️ **"Solo IDs"**
   - Se i dati vengono preservati nella response

### **Cosa Aspettarsi:**
- Request dovrebbe mostrare `models: [oggetti]` e `drawing: {oggetto}`
- Response dovrebbe preservare i dati (niente più `models: []`)
- Debug panel dovrebbe mostrare ✅ **"Models/Drawing preservati"**

## 🎯 **Benefici**

1. **Compatibilità Backend**: Il frontend ora invia il formato che il backend si aspetta
2. **Debugging Migliorato**: Distinzione chiara tra formati ID vs oggetti
3. **Prevenzione Perdita Dati**: Evita la perdita di associazioni Model-Sheet
4. **Backward Compatibility**: Il debug panel supporta entrambi i formati

## 🚨 **Note Importanti**

### **Referenze Circolari**
Per evitare referenze circolari JSON, tutti gli oggetti inviati hanno `sheets: []`:

```javascript
const modelToAdd = {
  // ... tutti i campi del modello
  sheets: [] // IMPORTANTE: Evita referenze circolari
}
```

### **Fallback**
Se un modello/drawing non viene trovato negli array `availableModels`/`availableDrawings`, viene ignorato silenziosamente per evitare errori.

### **Testing Backend**
Il backend deve essere in grado di accettare questo formato. Se il backend continua a ignorare i dati, potrebbe essere necessario verificare:
1. Il controller REST accetta campi `models` e `drawing`
2. Il mapping JPA è configurato correttamente
3. I metodi di serializzazione/deserializzazione JSON

## 📊 **Prima vs Dopo**

| Aspetto | Prima | Dopo |
|---------|-------|------|
| **Models** | `modelIds: [1103, 1104]` | `models: [{id:1103, name:"..."}, ...]` |
| **Drawing** | `drawingId: 1101` | `drawing: {id:1101, name:"..."}` |
| **Debug** | Solo conteggio ID | Indicatori oggetti vs ID |
| **Perdita Dati** | ❌ Modelli/Drawing persi | ✅ Dovrebbe essere preservato |
| **Backend** | Ignora i campi | Dovrebbe processare correttamente |

La modifica è **backward compatible** - il debug panel riconosce e analizza correttamente entrambi i formati.