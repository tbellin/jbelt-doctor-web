# Analisi Strutture JSON - Frontend vs Backend

## 📋 **Panoramica del Problema**

Il frontend invia correttamente i dati, ma il backend non li processa. Questo documento analizza le strutture JSON attese vs quelle ricevute.

## 🔄 **Operazioni Fogli (Sheets)**

### ✅ **Struttura JSON Inviata dal Frontend (Corretta)**

#### Creazione Foglio (POST /api/sheets)
```json
{
  "code": "s004",
  "name": "Foglio 004",
  "formatType": "A3O",
  "modelIds": [1103, 1104],     // ✅ IDs dei modelli PART/ASSEMBLY
  "drawingId": 1101,            // ✅ ID del disegno
  "balloon": "optional text"    // ✅ Campo opzionale
}
```

#### Aggiornamento Foglio (PUT /api/sheets/{id})
```json
{
  "id": 1303,
  "code": "s003", 
  "name": "Foglio 003",
  "formatType": "A3O",
  "modelIds": [1103, 1104],     // ✅ IDs dei modelli PART/ASSEMBLY
  "drawingId": 1101             // ✅ ID del disegno (se impostato)
}
```

### ❌ **Struttura JSON Ricevuta dal Backend (Problematica)**

#### Response Creazione/Aggiornamento
```json
{
  "id": 1304,
  "code": "s004",
  "name": "Foglio 004", 
  "formatType": "A3O",
  "format": null,
  "drawing": null,              // ❌ PERSO! Era drawingId: 1101
  "models": []                  // ❌ PERSO! Erano modelIds: [1103, 1104]
}
```

## 🎯 **Cosa Funziona vs Cosa Non Funziona**

### ✅ **Funziona Correttamente:**
- Campi base: `code`, `name`, `formatType`
- Autenticazione JWT
- Validazione frontend
- Status HTTP 200/201 (successo apparente)

### ❌ **Non Funziona (Backend Ignora):**
- Campo `modelIds` → non viene mappato a `models`
- Campo `drawingId` → non viene mappato a `drawing`  
- Relazioni tra entità

## 🔧 **Strutture JSON Attese dal Backend**

### **Ipotesi 1: Backend Vuole Oggetti Completi**
```json
{
  "code": "s004",
  "name": "Foglio 004",
  "formatType": "A3O", 
  "drawing": {              // Oggetto completo invece di ID
    "id": 1101,
    "name": "Disegno 02",
    "modelType": "DRAWING"
  },
  "models": [               // Array di oggetti completi
    {
      "id": 1103,
      "name": "Modello 1", 
      "modelType": "PART"
    },
    {
      "id": 1104,
      "name": "Modello 2",
      "modelType": "PART" 
    }
  ]
}
```

### **Ipotesi 2: Backend Vuole Nomi di Campo Diversi**
```json
{
  "code": "s004",
  "name": "Foglio 004",
  "formatType": "A3O",
  "drawing": 1101,          // ID diretto
  "models": [1103, 1104]    // Array di IDs diretti
}
```

### **Ipotesi 3: Backend Vuole Struttura JPA/Hibernate**
```json
{
  "code": "s004", 
  "name": "Foglio 004",
  "formatType": "A3O",
  "drawingId": 1101,        // Campo separato per foreign key
  "modelIds": [1103, 1104], // Campo separato per relazione many-to-many
  "drawing": null,          // Popolato dal backend nella response
  "models": null            // Popolato dal backend nella response
}
```

## 📊 **Test Comparativo**

### **Associazione Foglio-Disegno (Prima Funzionava)**

#### Test: Verifica se l'associazione drawing funziona ancora
```bash
# Frontend invia:
{
  "drawingId": 1101
}

# Backend dovrebbe rispondere:
{
  "drawing": {
    "id": 1101,
    "name": "Disegno 02"
  }
}
```

### **Associazione Foglio-Modelli (Non Funziona)**

#### Test: Verifica associazione models
```bash
# Frontend invia:
{
  "modelIds": [1103, 1104]
}

# Backend risponde:
{
  "models": []  // ❌ VUOTO!
}
```

## 🎯 **Raccomandazioni per il Backend**

### **1. Controller REST Sheet**
Il controller dovrebbe accettare DTO con:
```java
public class SheetDTO {
    private String code;
    private String name;
    private String formatType;
    private Long drawingId;      // ✅ Accetta ID
    private List<Long> modelIds; // ✅ Accetta lista di IDs
    private String balloon;
    
    // Il backend mapperà gli IDs agli oggetti
}
```

### **2. Service Layer**
```java
@Service
public class SheetService {
    
    public Sheet createSheet(SheetDTO dto) {
        Sheet sheet = new Sheet();
        sheet.setCode(dto.getCode());
        sheet.setName(dto.getName());
        sheet.setFormatType(dto.getFormatType());
        
        // ✅ Mappa drawingId → drawing
        if (dto.getDrawingId() != null) {
            Model drawing = modelRepository.findById(dto.getDrawingId());
            sheet.setDrawing(drawing);
        }
        
        // ✅ Mappa modelIds → models  
        if (dto.getModelIds() != null) {
            List<Model> models = modelRepository.findAllById(dto.getModelIds());
            sheet.setModels(models);
        }
        
        return sheetRepository.save(sheet);
    }
}
```

## 🏃‍♂️ **Prossimi Passi**

1. **Testare con debug panel** le chiamate attuali
2. **Verificare se drawingId funziona** ancora
3. **Identificare formato esatto** che il backend si aspetta
4. **Proporre correzione backend** o adattare frontend

## 📊 **Strumenti di Debug Disponibili**

Il pannello debug ora offre le seguenti funzionalità per documentare il problema:

### **Export Dati**
- **Tutti i Log**: Esporta completo di tutte le chiamate API
- **Solo Operazioni Fogli**: Filtra e esporta solo le chiamate a `/api/sheets`
- **Solo Operazioni Modelli**: Filtra e esporta solo le chiamate a `/api/models`
- **Report Completo**: Genera report strutturato con analisi automatica dei problemi
- **Export Singolo**: Esporta specifico log entry per analisi dettagliata

### **Statistiche Real-time**
- Contatore chiamate API totali
- Contatore operazioni fogli
- **Contatore perdita ModelIds**: Mostra quante volte i modelIds vengono inviati ma i models non tornano
- **Contatore perdita DrawingId**: Mostra quante volte drawingId viene inviato ma drawing non torna

### **Indicatori Visivi**
- Badge colorati per distinguere operazioni SHEET vs MODEL
- Indicatori rossi "❌ PERDITA DATI!" quando i dati vengono persi
- Confronto automatico Request → Response per ogni operazione

Il pannello debug ora mostrerà chiaramente la **perdita dati** con indicatori rossi quando `modelIds` viene inviato ma `models` torna vuoto.