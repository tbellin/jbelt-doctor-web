# 🚨 SOLUZIONE: Backend Richiede ID nel Body

## 📋 **Problema Identificato**

Dal log `api-logs-2025-06-11T09-15-15.json` è emerso che **tutte le chiamate PUT falliscono** con errore:

```json
{
  "status": 400,
  "message": "error.idnull",
  "params": "sheet"
}
```

## 🔍 **Root Cause Analysis**

### **❌ Quello che Pensavamo:**
- Backend confuso dall'ID extra nel body
- Soluzione: rimuovere l'ID dal payload

### **✅ Realtà Scoperta:**
- **Il backend Spring Boot RICHIEDE l'ID nel body**
- L'ID nell'URL non è sufficiente
- Errore `error.idnull` = "manca l'ID nell'entità Sheet"

## 🔧 **Correzione Applicata**

### **Ripristinato ID nel body di TUTTE le chiamate PUT:**

#### **1. ModelSheetsManager.vue**
```javascript
// Aggiunta associazione
const updateResponse = await sheetsApi.update(sheetId, {
  id: sheetId,           // ✅ AGGIUNTO: Backend lo richiede
  models: updatedModels
})

// Rimozione associazione  
const response = await sheetsApi.update(sheet.id!, {
  id: sheet.id,          // ✅ AGGIUNTO: Backend lo richiede
  models: updatedModels
})
```

#### **2. Sheets Index Page**
```javascript
if (editingSheet.value) {
  const updateData = {
    ...sheetData,
    id: editingSheet.value.id  // ✅ AGGIUNTO: Backend lo richiede
  }
  response = await sheets.update(editingSheet.value.id!, updateData)
}
```

## 📊 **Formato Finale Corretto**

### **Request Body per PUT /api/sheets/1303:**
```json
{
  "id": 1303,                    // ✅ RICHIESTO dal backend
  "code": "s003",
  "name": "Foglio 003", 
  "formatType": "A3O",
  "models": [                    // ✅ Oggetti completi
    {
      "id": 1103,
      "code": "p01",
      "name": "Part 01",
      "modelType": "PART",
      "instanceType": "NORMAL",
      "file": null,
      "designer": null,
      "item": null,
      "parent": null,
      "instance": null,
      "sheets": []
    }
  ],
  "drawing": {                   // ✅ Oggetto completo (se presente)
    "id": 1101,
    "code": "d02", 
    "name": "Disegno 02",
    "modelType": "DRAWING",
    "instanceType": "NORMAL",
    "file": null,
    "designer": null,
    "item": null,
    "parent": null,
    "instance": null,
    "sheets": []
  }
}
```

## ⚡ **Perché il Backend Richiede l'ID**

### **Spiegazione Tecnica:**
1. **JPA/Hibernate**: Quando deserializza il JSON, ha bisogno dell'ID per identificare l'entità
2. **Merge vs Persist**: Con l'ID, sa che deve fare UPDATE (merge) e non INSERT (persist)
3. **Validation**: Spring Boot valida che l'entità abbia un ID valido prima di salvarla

### **Pattern Spring Boot Tipico:**
```java
@PutMapping("/sheets/{id}")
public ResponseEntity<Sheet> updateSheet(@PathVariable Long id, @RequestBody Sheet sheet) {
    if (sheet.getId() == null) {
        throw new BadRequestException("error.idnull", "sheet");
    }
    // ... logica di aggiornamento
}
```

## 🎯 **Risultato Atteso**

Con questa correzione, le chiamate PUT dovrebbero:
1. ✅ **Non fallire più** con `error.idnull`
2. ✅ **Preservare gli oggetti** models e drawing
3. ✅ **Aggiornare correttamente** le associazioni

## 🧪 **Test di Verifica**

### **Scenario di Test:**
1. Vai alla pagina Models
2. Trova un modello PART o ASSEMBLY  
3. Clicca "Aggiungi Foglio"
4. Seleziona uno o più fogli
5. Clicca "Aggiungi Selezionati"

### **Risultato Atteso:**
- ✅ Status 200 invece di 400
- ✅ Backend preserva gli oggetti models
- ✅ Tabella mostra i badge colorati dei modelli associati
- ✅ Debug panel mostra "✅ Models preservati"

## 🏆 **Lezione Appresa**

**Il backend Spring Boot segue il pattern REST standard:**
- URL per identificare la risorsa: `PUT /api/sheets/{id}`
- Body con entità completa incluso ID: `{"id": 1303, ...}`

Non era confusione dell'ID, ma **requisito del framework**!