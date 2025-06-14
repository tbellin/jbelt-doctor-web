⏺ Rapporto Applicativo JBelt Doctor Web

  📋 Panoramica del Sistema

  JBelt Doctor Web è un'applicazione frontend Vue.js/Nuxt.js progettata per la gestione di disegni CAD, fogli tecnici, balloon e
  annotazioni in ambiente industriale. L'applicativo si integra con sistemi CAD PTC Creo Parametric e fornisce interfacce web
  moderne per la visualizzazione e gestione dei dati tecnici.

  🏗️ Architettura Tecnica

  Stack Tecnologico

  - Frontend: Nuxt.js 3 + Vue.js 3 + TypeScript
  - Package Manager: pnpm
  - UI Framework: Bootstrap 5 + Bootstrap Icons
  - State Management: Pinia stores
  - HTTP Client: Axios con interceptors JWT
  - Internazionalizzazione: Sistema i18n personalizzato (EN/IT)
  - Export: XLSX per generazione file Excel
  - Autenticazione: JWT-based con Spring Boot backend

  Struttura Directories

  app/
  ├── components/          # Componenti Vue riutilizzabili
  │   ├── Auth/           # Autenticazione
  │   ├── Dashboard/      # Dashboard UI
  │   ├── Layout/         # Layout components
  │   ├── Balloons/       # Gestione balloon
  │   ├── Models/         # Gestione modelli
  │   └── Sheets/         # Gestione fogli
  ├── composables/        # Vue composables per logica riutilizzabile
  ├── stores/             # Pinia stores per stato globale
  ├── pages/              # File-based routing
  ├── layouts/            # Page layouts
  ├── middleware/         # Route middleware
  ├── i18n/               # File traduzioni (en/, it/)
  └── plugins/            # Nuxt plugins

  🔧 Funzionalità Principali

  1. Sistema di Autenticazione

  - Login/logout con JWT tokens
  - Gestione ruoli (USER, ADMIN)
  - Password reset e change password
  - Protezione route con middleware

  2. Gestione Disegni (Drawings)

  - Ricerca dinamica: Ricerca disegni per nome/codice
  - Selezione fogli: Dropdown cascata Disegno → Foglio
  - Visualizzazione modelli: Lista modelli associati al foglio
  - Export Excel: Generazione report con dati strutturati

  3. Gestione Balloon e Note

  - Editor dedicato: Pagina /dashboard/balloon/{id} per creazione/modifica
  - Gestione attributi: Fino a 4 attributi per nota con TypeValue e ordinamento
  - Associazioni: Collegamento Balloon ↔ Note ↔ Attributi
  - Filtri avanzati: Filtro per Disegno → Foglio con API integration

  4. Sistema Multilingua

  - Supporto: Italiano e Inglese
  - Namespace: Traduzioni organizzate per pagina/componente
  - Cambio dinamico: Language switcher senza reload pagina

  5. Debug e Sviluppo

  - Debug mode: Pannelli collassabili con informazioni tecniche
  - Logging dettagliato: Console logging per API calls e state management
  - Environment-based: Attivazione tramite NUXT_DEBUG=true

  📊 Modello Dati

  Entità Principali

  // Drawing (Disegno)
  interface IModel {
    id: number
    name: string
    code: string
    modelType: 'DRAWING' | 'PART' | 'ASSEMBLY'
    sheets: ISheet[]
  }

  // Sheet (Foglio)
  interface ISheet {
    id: number
    creoId: string
    name: string
    drawing: IModel
    models: IModel[]  // Modelli associati al foglio
  }

  // Balloon
  interface IBaloon {
    id: number
    creoId: string
    baloonValue: string
    baloonType: string
    sheet: ISheet
  }

  // Note
  interface INote {
    id: number
    creoId: string
    noteValue: string
    noteType: string
    baloon: IBaloon
  }

  // Attribute
  interface IAttributeEntity {
    id: number
    order: number  // 1-4
    attributeValue: string
    typeValue: 'STRING' | 'INTEGER' | 'DOUBLE' | 'BOOLEAN' | 'DATE' | 'CONTENT' | 'URL'
    note: INote
  }

  Relazioni

  - Drawing 1:N Sheet: Un disegno può avere più fogli
  - Sheet N:M Model: Associazione bidirezionale fogli-modelli
  - Sheet 1:N Balloon: Un foglio può avere più balloon
  - Balloon 1:1 Note: Relazione uno-a-uno balloon-nota
  - Note 1:4 Attribute: Una nota può avere fino a 4 attributi ordinati

  📋 Template Excel - Struttura e Regole

  Struttura File Excel Generato

  Il sistema genera file Excel con la seguente struttura standardizzata:

  Row 1:  | Nome Disegno        | [DRAWING_NAME]           |
  Row 2:  | Nome Foglio         | [SHEET_NAME]             |
  Row 3:  | ID Foglio           | [SHEET_ID]               |
  Row 4:  |                     |                          |
  Row 5:  | MODELLI ASSOCIATI AL FOGLIO                     |
  Row 6:  | ID Modello | Nome Modello | Codice | Tipo      |
  Row 7+: | [MODEL_DATA_ROWS]                              |
  Row X:  |                     |                          |
  Row X+1:| BALLOON E NOTE                                 |
  Row X+2:| Balloon | Nota | Attributo 1 | Attr 2 | Attr 3 | Attr 4 |
  Row X+3+| [BALLOON_DATA_ROWS]                           |

  Regole di Generazione

  1. Naming Convention

  const filename = `${drawingName}_${sheetName}_export.xlsx`
  // Caratteri non alfanumerici sostituiti con underscore
  // Estensione .xlsx preservata

  2. Sezione Header

  - Nome Disegno: drawing.name || drawing.code
  - Nome Foglio: sheet.creoId || sheet.name
  - ID Foglio: sheet.id.toString()

  3. Sezione Modelli

  - Header: Sempre presente anche se vuota
  - Dati: Da sheet.models[] ottenuto via GET /api/sheets/{id}
  - Colonne:
    - ID Modello: model.id
    - Nome Modello: model.name || '-'
    - Codice: model.code || '-'
    - Tipo: model.modelType || '-'

  4. Sezione Balloon e Note

  - Header: 6 colonne fisse
  - Balloon: balloon.baloonValue || balloon.creoId
  - Nota: note.creoId || note.noteValue
  - Attributi: Ordinati per attribute.order (1-4)
  - Valori mancanti: Rappresentati con '-'

  5. Algoritmo Attributi

  const getAttributeByOrder = (attributes, order) => {
    const attribute = attributes.find(attr => attr.order === order)
    return attribute?.attributeValue || ''
  }

  // Utilizzo
  t('drawings:attribute_1'): getAttributeByOrder(attributes, 1) || '-'
  t('drawings:attribute_2'): getAttributeByOrder(attributes, 2) || '-'
  // etc...

  Template Configurabile

  Per implementare un template Excel configurabile:

  1. Struttura JSON Template

  {
    "template_name": "Technical_Drawing_Export_v1",
    "version": "1.0",
    "sections": [
      {
        "name": "header",
        "type": "metadata",
        "rows": [
          {"label": "Nome Disegno", "value": "{{drawing.name}}"},
          {"label": "Nome Foglio", "value": "{{sheet.creoId}}"},
          {"label": "ID Foglio", "value": "{{sheet.id}}"}
        ]
      },
      {
        "name": "models",
        "type": "table",
        "title": "MODELLI ASSOCIATI AL FOGLIO",
        "headers": ["ID Modello", "Nome Modello", "Codice", "Tipo"],
        "data_source": "sheet.models",
        "columns": ["id", "name", "code", "modelType"]
      },
      {
        "name": "balloons",
        "type": "table",
        "title": "BALLOON E NOTE",
        "headers": ["Balloon", "Nota", "Attributo 1", "Attributo 2", "Attributo 3", "Attributo 4"],
        "data_source": "balloonData",
        "columns": [
          "balloon.baloonValue",
          "note.creoId",
          "attributes[0].value",
          "attributes[1].value",
          "attributes[2].value",
          "attributes[3].value"
        ]
      }
    ]
  }

  2. Engine di Template

  class ExcelTemplateEngine {
    constructor(template) {
      this.template = template
    }

    generate(data) {
      const worksheetData = []

      for (const section of this.template.sections) {
        switch (section.type) {
          case 'metadata':
            worksheetData.push(...this.generateMetadataSection(section, data))
            break
          case 'table':
            worksheetData.push(...this.generateTableSection(section, data))
            break
        }
        worksheetData.push([]) // Empty row separator
      }

      return worksheetData
    }

    generateMetadataSection(section, data) {
      return section.rows.map(row => [
        row.label,
        this.interpolate(row.value, data)
      ])
    }

    generateTableSection(section, data) {
      const rows = []
      rows.push([section.title])
      rows.push(section.headers)

      const dataSource = this.getNestedValue(data, section.data_source)
      for (const item of dataSource) {
        const row = section.columns.map(col =>
          this.getNestedValue(item, col) || '-'
        )
        rows.push(row)
      }

      return rows
    }
  }

  3. Utilizzo

  const template = await loadTemplate('technical_drawing_v1.json')
  const engine = new ExcelTemplateEngine(template)
  const worksheetData = engine.generate({
    drawing: selectedDrawing.value,
    sheet: selectedSheet.value,
    balloonData: balloonData.value
  })

  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')
  XLSX.writeFile(wb, filename)

  🚀 Deployment e Configuration

  Environment Variables

  NUXT_PUBLIC_API_BASE=http://localhost:8080
  NUXT_PUBLIC_API_HOST=localhost
  NUXT_PUBLIC_API_PORT=8080
  NUXT_DEBUG=false

  Build Commands

  # Development
  pnpm dev

  # Production Build
  pnpm build
  pnpm preview

  # Docker
  docker-compose up --build

  🔍 Monitoring e Debug

  Debug Mode Features

  - API Call Logging: Tutti i request/response tracciati
  - State Management: Stato reattivo delle applicazioni
  - i18n Status: Stato traduzioni e namespace caricati
  - Performance Metrics: Timing delle operazioni

  Attivazione Debug

  NUXT_DEBUG=true

  Attiva pannelli debug collassabili in tutte le pagine principali.

  ---
  Versione: 1.0.0Data: Dicembre 2024Maintainer: JBelt Development Team