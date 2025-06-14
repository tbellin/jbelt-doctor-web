# Excel Templates

Questa directory contiene i **template master** Excel utilizzati per l'export dei dati dalla pagina drawings.

## Flusso dei Template

1. **Template Master**: `/app/assets/excel-templates/` (versioni originali)
2. **Template Serviti**: `/public/assets/excel-templates/` (copie per il web server)
3. **File Generati**: Nuovi file Excel con dati popolati

## File Template

### template-01.xlsx
Template principale per l'export dei disegni tecnici con struttura definita da `excel.properties`.

**Struttura attuale (coordinate da excel.properties):**
- **J2**: DRAWING_NAME - Nome del disegno
- **J4**: MODEL_NAME - Nome del primo modello
- **A7+**: BALLOON_VALUE+ - Valori balloon (crescenti per riga)
- **B7+**: ATTRIBUTE1_VALUE+ - Attributo 1 (crescenti per riga)
- **C7+**: ATTRIBUTE2_VALUE+ - Attributo 2 (crescenti per riga)
- **D7+**: ATTRIBUTE3_VALUE+ - Attributo 3 (crescenti per riga)
- **E7+**: ATTRIBUTE4_VALUE+ - Attributo 4 (crescenti per riga)

### template-technical.xlsx
Template avanzato con layout alternativo per documenti tecnici più complessi.

## Utilizzo

1. **Modifica Template**: Lavora sui file in `/app/assets/excel-templates/`
2. **Sincronizza**: Esegui `pnpm sync-templates` per copiare in `/public/`
3. **Configura Coordinate**: Modifica `excel.properties` per definire le posizioni
4. **Testa**: Usa la pagina drawings per scaricare il file Excel popolato

## Creazione Nuovi Template

1. Creare il file Excel in `/app/assets/excel-templates/`
2. Aggiungere/modificare coordinate in `excel.properties`
3. Eseguire `pnpm sync-templates`
4. Testare con dati reali dalla pagina drawings

## Comandi Utili

```bash
# Sincronizza template da app/ a public/
pnpm sync-templates

# Avvia in modalità debug per vedere i log
pnpm dev:debug
```

## Note Tecniche

- I template devono essere file `.xlsx` validi
- Le celle devono essere formattate correttamente per il tipo di dato
- Evitare formule complesse che potrebbero causare errori
- Testare sempre su diversi browser