// app/utils/excel-properties-engine.ts
import * as XLSX from 'xlsx';
import PropertiesParser, { type ExcelProperties } from './properties-parser';

export interface SimpleTemplateData {
  drawing_name: string;
  model_name: string; // Primo modello o singolo modello
  balloons: Array<{
    balloon_value: string;
    attribute1_value: string;
    attribute2_value: string;
    attribute3_value: string;
    attribute4_value: string;
  }>;
}

export class ExcelPropertiesEngine {
  private workbook: XLSX.WorkBook;
  private worksheet: XLSX.WorkSheet;
  private properties: ExcelProperties;

  constructor(templateBuffer: ArrayBuffer, properties: ExcelProperties) {
    // Legge il template originale
    const originalWorkbook = XLSX.read(templateBuffer, { type: 'buffer' });
    
    // Crea una COPIA del workbook per non modificare l'originale
    this.workbook = XLSX.utils.book_new();
    
    // Copia tutti i fogli dal template originale
    originalWorkbook.SheetNames.forEach(sheetName => {
      const originalSheet = originalWorkbook.Sheets[sheetName];
      // Crea una copia profonda del foglio
      const copiedSheet = JSON.parse(JSON.stringify(originalSheet));
      XLSX.utils.book_append_sheet(this.workbook, copiedSheet, sheetName);
    });
    
    // Usa il primo foglio della copia
    this.worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    this.properties = properties;
    
    console.log('[ExcelPropertiesEngine] Template copiato in memoria per la modifica');
  }

  /**
   * Carica template e properties configuration
   */
  static async create(propertiesPath?: string): Promise<ExcelPropertiesEngine> {
    try {
      // Carica configurazione properties
      const properties = await PropertiesParser.loadProperties(propertiesPath);
      console.log('[ExcelPropertiesEngine] Loaded properties:', properties);

      // Carica template file come asset
      console.log('[ExcelPropertiesEngine] Loading template as asset:', properties.templateFile);
      
      const templateBuffer = await this.loadTemplateAsset();
      
      return new ExcelPropertiesEngine(templateBuffer, properties);
      
    } catch (error) {
      console.error('[ExcelPropertiesEngine] Error creating engine:', error);
      throw new Error(`Cannot create Excel engine: ${error.message}`);
    }
  }

  /**
   * Carica template incorporato o crea fallback
   */
  private static async loadTemplateAsset(): Promise<ArrayBuffer> {
    try {
      console.log('[ExcelPropertiesEngine] Loading embedded template...');
      
      // Prova a importare il template base64
      try {
        const { TEMPLATE_BASE64 } = await import('@/assets/template-base64');
        console.log('[ExcelPropertiesEngine] Embedded template found, decoding...');
        
        // Decodifica da base64
        const binaryString = atob(TEMPLATE_BASE64);
        const buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          buffer[i] = binaryString.charCodeAt(i);
        }
        
        console.log('[ExcelPropertiesEngine] ✅ Embedded template loaded successfully, size:', buffer.byteLength, 'bytes');
        return buffer.buffer;
        
      } catch (importError) {
        console.warn('[ExcelPropertiesEngine] Embedded template not found:', importError.message);
        throw new Error('Embedded template not available');
      }
      
    } catch (error) {
      console.error('[ExcelPropertiesEngine] ❌ Error loading embedded template:', error);
      console.warn('[ExcelPropertiesEngine] 🔄 Creating fallback template with structure from original...');
      
      // Fallback con template che ha la struttura del template reale
      return this.createTemplateWithRealStructure();
    }
  }

  /**
   * Carica template da file o crea template vuoto come fallback (DEPRECATED)
   */
  private static async loadTemplate(templatePath: string): Promise<ArrayBuffer> {
    try {
      console.log('[ExcelPropertiesEngine] Attempting to load template from:', templatePath);
      
      const response = await fetch(templatePath);
      console.log('[ExcelPropertiesEngine] Template fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('[ExcelPropertiesEngine] ✅ Template loaded successfully, size:', arrayBuffer.byteLength, 'bytes');
      
      return arrayBuffer;
    } catch (error) {
      console.error('[ExcelPropertiesEngine] ❌ Error loading template:', error);
      console.warn('[ExcelPropertiesEngine] 🔄 Creating fallback empty template...');
      
      // Crea template vuoto come fallback
      return this.createEmptyTemplate();
    }
  }

  /**
   * Crea un template che simula la struttura reale del template originale
   */
  private static createTemplateWithRealStructure(): ArrayBuffer {
    console.log('[ExcelPropertiesEngine] Creating template with real structure (based on inspection)...');
    
    // Crea un workbook che simula il template reale
    const wb = XLSX.utils.book_new();
    
    // Struttura basata sull'ispezione del template reale
    const worksheetData = [
      // Row 1
      ['', '', '', '', '', '', '', '', '', 'Form 06 P0 - 1 Rev. 1'], // X1
      // Row 2 - J2 conterrà il drawing name
      ['', '', '', '', '', 'Test card', '', '', '', ''], // F2, J2 sarà popolato
      // Row 3
      ['', '', 'Codice\nPart number', '', '', '', '', '', '', 'Rev:'], // B3, J3
      // Row 4 - J4 conterrà il model name
      ['', '', 'Commessa\nJob', '', '', '', '', '', '', ''], // B4, J4 sarà popolato
      // Row 5
      ['', '', 'SCL', '', '', 'ODL:', '', '', '', 'FASE: 50'], // B5, F5, J5
      // Row 6
      ['', '', '', '', '', '', 'n° BALL', '', '', ''], // B6
      // Row 7 - A7+ conterrà i balloon data
      ['', '', '', '', '', '', '', '', '', ''] // Row 7 dove iniziano i balloon
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Aggiungi alcune celle specifiche per simulare il template reale
    // X1 - header
    ws['X1'] = { v: 'Form 06 P0 - 1 Rev. 1', t: 's' };
    // F2 - Test card
    ws['F2'] = { v: 'Test card', t: 's' };
    // B3 - Codice label
    ws['B3'] = { v: 'Codice\nPart number', t: 's' };
    // J3 - Rev label  
    ws['J3'] = { v: 'Rev:', t: 's' };
    // B4 - Commessa label
    ws['B4'] = { v: 'Commessa\nJob', t: 's' };
    // B5 - SCL
    ws['B5'] = { v: 'SCL', t: 's' };
    // F5 - ODL label
    ws['F5'] = { v: 'ODL:', t: 's' };
    // J5 - Fase info
    ws['J5'] = { v: 'FASE: 50', t: 's' };
    // B6 - n° BALL header
    ws['B6'] = { v: 'n° BALL', t: 's' };
    
    // Imposta larghezze colonne simili al template reale
    ws['!cols'] = [
      { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, // A-E
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, // F-J
      { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }  // K-O
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Foglio1');
    
    // Converte in buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('[ExcelPropertiesEngine] ✅ Template with real structure created, size:', buffer.byteLength, 'bytes');
    
    return buffer;
  }

  /**
   * Crea un template Excel vuoto come fallback (DEPRECATED)
   */
  private static createEmptyTemplate(): ArrayBuffer {
    console.log('[ExcelPropertiesEngine] Creating simple empty template...');
    
    // Crea un workbook vuoto
    const wb = XLSX.utils.book_new();
    
    // Crea un foglio con struttura base
    const worksheetData = [
      ['', '', '', '', '', '', '', '', '', 'TEMPLATE FALLBACK'],  // Row 1
      ['', '', '', '', '', '', '', '', '', ''],                   // Row 2 - J2 per drawing name
      ['', '', '', '', '', '', '', '', '', ''],                   // Row 3
      ['', '', '', '', '', '', '', '', '', ''],                   // Row 4 - J4 per model name
      ['', '', '', '', '', '', '', '', '', ''],                   // Row 5
      ['', '', '', '', '', '', '', '', '', ''],                   // Row 6
      ['Balloon', 'Attr1', 'Attr2', 'Attr3', 'Attr4', '', '', '', '', ''] // Row 7 - Headers
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Imposta larghezze colonne
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Drawings Export');
    
    // Converte in buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('[ExcelPropertiesEngine] ✅ Empty template created, size:', buffer.byteLength, 'bytes');
    
    return buffer;
  }

  /**
   * Popola il template con i dati semplificati
   */
  populateTemplate(data: SimpleTemplateData): void {
    console.log('[ExcelPropertiesEngine] Populating COPY of template with data:', data);
    console.log('[ExcelPropertiesEngine] Using coordinates:', this.properties.coordinates);

    // Popola dati singoli
    this.setCellValue(this.properties.coordinates.drawing_name, data.drawing_name);
    this.setCellValue(this.properties.coordinates.model_name, data.model_name);

    // Popola balloons (dati multipli crescenti per riga)
    console.log(`[ExcelPropertiesEngine] Populating ${data.balloons.length} balloons starting from coordinates:`, {
      balloon_value: this.properties.coordinates.balloon_value,
      attribute1_value: this.properties.coordinates.attribute1_value,
      attribute2_value: this.properties.coordinates.attribute2_value,
      attribute3_value: this.properties.coordinates.attribute3_value,
      attribute4_value: this.properties.coordinates.attribute4_value
    });

    data.balloons.forEach((balloon, index) => {
      const rowOffset = index; // 0, 1, 2, 3, ...
      
      const balloonCoord = PropertiesParser.getCoordinateForRow(
        this.properties.coordinates.balloon_value, 
        rowOffset
      );
      const attr1Coord = PropertiesParser.getCoordinateForRow(
        this.properties.coordinates.attribute1_value, 
        rowOffset
      );
      const attr2Coord = PropertiesParser.getCoordinateForRow(
        this.properties.coordinates.attribute2_value, 
        rowOffset
      );
      const attr3Coord = PropertiesParser.getCoordinateForRow(
        this.properties.coordinates.attribute3_value, 
        rowOffset
      );
      const attr4Coord = PropertiesParser.getCoordinateForRow(
        this.properties.coordinates.attribute4_value, 
        rowOffset
      );

      console.log(`[ExcelPropertiesEngine] Balloon ${index} coordinates:`, {
        balloon: balloonCoord,
        attr1: attr1Coord, 
        attr2: attr2Coord,
        attr3: attr3Coord,
        attr4: attr4Coord
      });

      // Imposta i valori
      this.setCellValue(balloonCoord, balloon.balloon_value);
      this.setCellValue(attr1Coord, balloon.attribute1_value);
      this.setCellValue(attr2Coord, balloon.attribute2_value);
      this.setCellValue(attr3Coord, balloon.attribute3_value);
      this.setCellValue(attr4Coord, balloon.attribute4_value);

      console.log(`[ExcelPropertiesEngine] ✅ Balloon ${index} populated: ${balloonCoord}="${balloon.balloon_value}", ${attr1Coord}="${balloon.attribute1_value}"`);
    });

    console.log('[ExcelPropertiesEngine] Template populated successfully');
  }

  /**
   * Imposta valore in una cella specifica
   */
  private setCellValue(cellAddress: string, value: any): void {
    if (!cellAddress || value === undefined || value === null) return;

    // Crea la cella se non esiste
    if (!this.worksheet[cellAddress]) {
      this.worksheet[cellAddress] = {};
    }

    // Imposta il valore
    this.worksheet[cellAddress].v = String(value || '');
    this.worksheet[cellAddress].t = 's'; // String type

    console.log(`[ExcelPropertiesEngine] Set cell ${cellAddress} = "${value}"`);
  }

  /**
   * Genera il file Excel
   */
  generateFile(filename: string): void {
    try {
      console.log(`[ExcelPropertiesEngine] Generating NEW file from template copy: ${filename}`);
      XLSX.writeFile(this.workbook, filename);
      console.log(`[ExcelPropertiesEngine] ✅ File generated successfully: ${filename}`);
      console.log(`[ExcelPropertiesEngine] Original template remains unchanged in /public/assets/excel-templates/`);
    } catch (error) {
      console.error('[ExcelPropertiesEngine] Error generating file:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  /**
   * Ottieni il workbook per ulteriori manipolazioni
   */
  getWorkbook(): XLSX.WorkBook {
    return this.workbook;
  }

  /**
   * Ottieni la configurazione properties caricata
   */
  getProperties(): ExcelProperties {
    return this.properties;
  }
}

export default ExcelPropertiesEngine;