# 🧪 Guida Completa per Testare le Associazioni Disegno-Foglio e Fogli-Modelli

## 🎯 Obiettivo del Test

Verificare che le associazioni tra **disegni**, **fogli** e **modelli** funzionino correttamente con:
- ✅ **JSON completi** con tutti gli ID necessari
- ✅ **Preservazione dati** durante operazioni CRUD
- ✅ **Arricchimento oggetti parziali** con dati completi
- ✅ **Validazione robusta** degli oggetti
- ✅ **Gestione errori** appropriata

## 🚀 Setup Iniziale

### 1. Avvio del Sistema
```bash
# Frontend
cd /Users/tiziano/Job/work/jbelt-doctor-deploy/frontend/jbelt-doctor-web
pnpm dev
# URL: http://localhost:3001

# Backend (presumo già in esecuzione)
# URL: http://localhost:8080
```

### 2. Login Admin
- **Username**: `admin`
- **Password**: `admin`

### 3. Verifica Dati di Base
Prima di testare, verifica che ci siano:
- ✅ **7 modelli** (PART, ASSEMBLY, DRAWING)
- ✅ **3 fogli** con diverse associazioni
- ✅ **Connessione backend** funzionante

## 📋 Test Cases Completi

### **SCENARIO 1: Associazioni Model-Sheet (PART/ASSEMBLY)**

#### Test 1.1: Visualizzazione Associazioni Esistenti
1. Vai a `/dashboard/models`
2. Trova un modello **PART** o **ASSEMBLY** (es. "Assembly 001")
3. Clicca sulla **freccia** per espandere
4. **Verifica**:
   - ✅ Visualizzazione fogli associati
   - ✅ Informazioni complete (ID, codice, nome, formato)
   - ✅ Badge appropriati per formatType
   - ✅ Pulsanti per azioni (view, edit, remove)

#### Test 1.2: Aggiunta Nuove Associazioni - Interfaccia Avanzata
1. Nel modello espanso, clicca **"Add Sheet"**
2. **Verifica Modal Avanzato**:
   - ✅ Ricerca per codice/nome funziona
   - ✅ Filtro per formato funziona
   - ✅ Filtro per drawing (with/without) funziona
   - ✅ Selezione multipla con checkbox
   - ✅ "Select All" / "Deselect All" funziona
   - ✅ Badge che mostrano stato (già associato/selezionato)
   - ✅ Contatori corretti (total/filtered/selected)

#### Test 1.3: Validazione JSON Completo per Associazioni
1. Apri **DevTools > Network**
2. Aggiungi un foglio al modello
3. **Verifica Request Payload**:
   ```json
   {
     "id": 1151,
     "creoId": "CA30",
     "code": "D30",
     "name": "Foglio D30",
     "formatType": "A3O",
     "format": null,
     "drawing": null,  // Preservato
     "models": [
       {
         "id": 1004,          // ✅ ID presente
         "code": "A001",      // ✅ Codice completo (non null)
         "name": "Assembly 001", // ✅ Nome completo
         "modelType": "ASSEMBLY", // ✅ Tipo completo
         "instanceType": "PARAMETRIC", // ✅ Istanza completa
         "file": null,
         "version": null,
         "item": null,
         "generic": null,
         "parent": null
         // ✅ Nessun 'sheets' per evitare circular ref
       }
     ]
   }
   ```

#### Test 1.4: Rimozione Associazioni
1. Clicca su **pulsante "unlink"** per rimuovere associazione
2. Conferma l'azione
3. **Verifica**:
   - ✅ Associazione rimossa dalla lista
   - ✅ Dati del foglio preservati (formato, drawing, etc.)
   - ✅ Altri modelli associati mantenuti

### **SCENARIO 2: Associazioni Drawing-Sheet**

#### Test 2.1: Visualizzazione per Modelli DRAWING
1. Espandi un modello **DRAWING**
2. **Verifica**:
   - ✅ Sezione "Sheets Using This Drawing"
   - ✅ Lista fogli che usano il disegno
   - ✅ Interfaccia read-only (appropriata per drawing)
   - ✅ Informazioni complete per ogni foglio

#### Test 2.2: Test da Prospettiva Sheet
1. Vai a `/dashboard/sheets`
2. Clicca **"Edit"** su un foglio esistente
3. **Verifica Dropdown Drawing**:
   - ✅ Lista completa modelli DRAWING
   - ✅ Formato "[DRAWING] Code - Name"
   - ✅ Selezione corrente evidenziata
   - ✅ Opzione "No drawing" disponibile

### **SCENARIO 3: Gestione Completa Sheets**

#### Test 3.1: Creazione Nuovo Foglio con Associazioni
1. Clicca **"New Sheet"**
2. Compila form completo:
   - **Code**: `TEST-001`
   - **Name**: `Test Sheet Complete`
   - **Format**: `A4V`
   - **Creo ID**: `TEST-CREO`
   - **Drawing**: Seleziona un disegno
   - **Models**: Seleziona 2-3 modelli PART/ASSEMBLY

3. **Verifica JSON di Creazione**:
   ```json
   {
     "creoId": "TEST-CREO",
     "code": "TEST-001",
     "name": "Test Sheet Complete",
     "formatType": "A4V",
     "format": null,
     "drawing": {
       "id": 1002,               // ✅ ID drawing presente
       "code": "D001",           // ✅ Dati completi
       "name": "Drawing 001",
       "modelType": "DRAWING",
       "instanceType": "NORMAL"
       // ✅ Oggetto drawing completo senza circular ref
     },
     "models": [
       {
         "id": 1001,             // ✅ ID modello presente
         "code": "P001",         // ✅ Dati completi
         "name": "Part 001",
         "modelType": "PART",
         "instanceType": "NORMAL"
         // ✅ Oggetto modello completo senza circular ref
       }
     ]
   }
   ```

#### Test 3.2: Modifica Sheet Esistente - Preservazione Dati
1. Modifica un foglio esistente
2. Cambia **solo il nome**: `"Updated Sheet Name"`
3. **Verifica che tutto il resto sia preservato**:
   - ✅ `formatType` mantenuto
   - ✅ `drawing` association mantenuta
   - ✅ `models` associations mantenute
   - ✅ `creoId` mantenuto

### **SCENARIO 4: Test di Robustezza e Validazione**

#### Test 4.1: Gestione Errori e Validazione
1. Prova a creare foglio **senza campi obbligatori**
   - **Verifica**: Messaggi di errore appropriati
2. Prova a **duplicare associazioni**
   - **Verifica**: Prevenzione automatica duplicati
3. Prova operazioni con **oggetti malformati**
   - **Verifica**: Validazione e gestione errori

#### Test 4.2: Performance e Caricamento
1. Espandi **tutti i modelli** rapidamente
2. **Verifica**:
   - ✅ Caricamento fluido senza lag
   - ✅ Dati consistenti tra espansioni
   - ✅ Nessun loop infinito o memory leak

### **SCENARIO 5: Debug e Logging**

#### Test 5.1: Console Debugging
1. Apri **DevTools > Console**
2. Esegui operazioni di associazione
3. **Verifica Log Dettagliati**:
   ```
   [ObjectEnrichment] Enriching model 1004 with complete data
   [ModelSheetsAssoc] Model to add: {id: 1004, code: "A001", ...}
   [SimpleSheets] ✅ Setting COMPLETE drawing association with ID: 1002
   [SimpleSheets] ✅ Setting COMPLETE models association with IDs: 1004(A001)
   ```

#### Test 5.2: Attivazione Debug Mode (se disponibile)
1. Set `NUXT_DEBUG=true` se configurato
2. **Verifica funzionalità debug**:
   - ✅ Pannelli debug visibili
   - ✅ JSON raw data accessibile
   - ✅ Test utilities funzionanti

## ✅ Checklist di Successo

### **Dati JSON Completi**
- [ ] ✅ Tutti gli oggetti associati hanno `id` valido
- [ ] ✅ Campi `code`, `name`, `modelType` non sono `null` negli oggetti completi
- [ ] ✅ Nessuna referenza circolare in payload API
- [ ] ✅ Preservazione completa di `formatType`, `drawing`, etc.

### **Funzionalità UI**
- [ ] ✅ Modal avanzato con filtri e ricerca
- [ ] ✅ Selezione multipla efficace
- [ ] ✅ Prevenzione duplicati automatica
- [ ] ✅ Messaggi di errore informativi
- [ ] ✅ Loading states appropriati

### **Robustezza Backend Integration**
- [ ] ✅ Tutti i payload accettati dal backend Spring Boot
- [ ] ✅ Nessun errore 400/500 durante operazioni
- [ ] ✅ Associations persistenti dopo refresh
- [ ] ✅ Dati consistenti tra diversi endpoint

### **Performance e UX**
- [ ] ✅ Operazioni fluide senza lag
- [ ] ✅ Responsive design su mobile/tablet
- [ ] ✅ Internazionalizzazione EN/IT corretta
- [ ] ✅ Icone e styling Bootstrap coerenti

## 🔧 Troubleshooting

### **Problema: Oggetti Parziali**
**Sintomo**: `code: null`, `modelType: null` in associazioni
**Soluzione**: Le utility di enrichment dovrebbero risolvere automaticamente

### **Problema: Circular Reference**
**Sintomo**: Errore JSON stringify o payload troppo grandi
**Soluzione**: Verificare che `sheets` e `models` siano esclusi appropriatamente

### **Problema: Validazione Failed**
**Sintomo**: Errori 400 dal backend
**Soluzione**: Verificare che tutti gli ID siano presenti e corretti

### **Problema: UI Non Responsive**
**Sintomo**: Loading infiniti o UI bloccata
**Soluzione**: Verificare console per errori JavaScript

## 🎉 Risultato Atteso

Al completamento di tutti i test, dovresti avere:

1. **Sistema Funzionante al 100%** per associazioni bidirezionali
2. **JSON Payload Completi** accettati dal backend Spring Boot
3. **Interfaccia Utente Professionale** con tutte le funzionalità avanzate
4. **Robustezza e Validazione** per prevenire errori
5. **Performance Ottimizzata** anche con molti dati

Il sistema dovrebbe ora gestire completamente tutte le associazioni CAD/PLM in modo professionale e affidabile! 🚀