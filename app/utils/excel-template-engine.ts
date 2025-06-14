// app/utils/excel-template-engine.ts
import * as XLSX from 'xlsx';
import type { ExcelTemplate } from '~/config/excel-coordinates';

export interface TemplateData {
  drawing: {
    name: string;
    code: string;
    id: number;
  };
  sheet: {
    name: string;
    id: number;
    creoId: string;
  };
  models: Array<{
    id: number;
    name: string;
    code: string;
    modelType: string;
  }>;
  balloons: Array<{
    balloon: {
      baloonValue: string;
      creoId: string;
    };
    note: {
      creoId: string;
      noteValue: string;
    };
    attributes: Array<{
      order: number;
      attributeValue: string;
    }>;
  }>;
}

export class ExcelTemplateEngine {
  private workbook: XLSX.WorkBook;
  private worksheet: XLSX.WorkSheet;
  private template: ExcelTemplate;

  constructor(templateBuffer: ArrayBuffer, template: ExcelTemplate) {
    this.workbook = XLSX.read(templateBuffer, { type: 'buffer' });
    this.worksheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    this.template = template;
  }

  /**
   * Carica template da file
   */
  static async loadTemplate(templatePath: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error('[ExcelTemplateEngine] Error loading template:', error);
      throw new Error(`Cannot load template from ${templatePath}`);
    }
  }

  /**
   * Popola il template con i dati
   */
  populateTemplate(data: TemplateData): void {
    console.log('[ExcelTemplateEngine] Populating template with data:', data);

    // Popola header information
    this.setCellValue(this.template.coordinates.drawing_name, data.drawing.name || '');
    this.setCellValue(this.template.coordinates.drawing_code, data.drawing.code || '');
    this.setCellValue(this.template.coordinates.sheet_name, data.sheet.name || '');
    this.setCellValue(this.template.coordinates.sheet_id, data.sheet.id);
    this.setCellValue(this.template.coordinates.sheet_creo_id, data.sheet.creoId || '');
    this.setCellValue(this.template.coordinates.export_date, new Date());

    // Popola models section
    this.populateModelsSection(data.models);

    // Popola balloons section  
    this.populateBalloonsSection(data.balloons);

    console.log('[ExcelTemplateEngine] Template populated successfully');
  }

  /**
   * Imposta valore in una cella specifica
   */
  private setCellValue(coordinate: any, value: any): void {
    if (!coordinate?.cell) return;

    const cell = coordinate.cell;
    
    // Formatta il valore in base al tipo
    let formattedValue = value;
    if (coordinate.type === 'date' && value instanceof Date) {
      formattedValue = value;
      // XLSX gestisce automaticamente le date
    } else if (coordinate.type === 'number') {
      formattedValue = Number(value) || 0;
    } else {
      formattedValue = String(value || '');
    }

    // Imposta il valore nella cella
    if (!this.worksheet[cell]) {
      this.worksheet[cell] = {};
    }
    this.worksheet[cell].v = formattedValue;
    this.worksheet[cell].t = this.getExcelType(coordinate.type);

    console.log(`[ExcelTemplateEngine] Set cell ${cell} = ${formattedValue} (type: ${coordinate.type})`);
  }

  /**
   * Popola la sezione modelli
   */
  private populateModelsSection(models: TemplateData['models']): void {
    const startRow = this.template.coordinates.models_start_row;
    const cols = this.template.coordinates.models_columns;

    models.forEach((model, index) => {
      const row = startRow + index;
      
      this.setCellValue(
        { cell: `${cols.id}${row}`, type: 'number' },
        model.id
      );
      this.setCellValue(
        { cell: `${cols.name}${row}`, type: 'text' },
        model.name || ''
      );
      this.setCellValue(
        { cell: `${cols.code}${row}`, type: 'text' },
        model.code || ''
      );
      this.setCellValue(
        { cell: `${cols.type}${row}`, type: 'text' },
        model.modelType || ''
      );
    });

    console.log(`[ExcelTemplateEngine] Populated ${models.length} models starting from row ${startRow}`);
  }

  /**
   * Popola la sezione balloon
   */
  private populateBalloonsSection(balloons: TemplateData['balloons']): void {
    // Calcola la riga di partenza dinamicamente in base ai modelli
    const modelsCount = this.getModelsCount();
    const startRow = this.template.coordinates.models_start_row + modelsCount + 3; // +3 per spaziatura
    
    const cols = this.template.coordinates.balloons_columns;

    balloons.forEach((balloonData, index) => {
      const row = startRow + index;

      // Balloon info
      this.setCellValue(
        { cell: `${cols.balloon_value}${row}`, type: 'text' },
        balloonData.balloon?.baloonValue || ''
      );
      this.setCellValue(
        { cell: `${cols.balloon_creo_id}${row}`, type: 'text' },
        balloonData.balloon?.creoId || ''
      );

      // Note info
      this.setCellValue(
        { cell: `${cols.note_value}${row}`, type: 'text' },
        balloonData.note?.noteValue || ''
      );
      this.setCellValue(
        { cell: `${cols.note_creo_id}${row}`, type: 'text' },
        balloonData.note?.creoId || ''
      );

      // Attributes (ordinati per order)
      const sortedAttributes = balloonData.attributes
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      this.setCellValue(
        { cell: `${cols.attribute_1}${row}`, type: 'text' },
        this.getAttributeByOrder(sortedAttributes, 1)
      );
      this.setCellValue(
        { cell: `${cols.attribute_2}${row}`, type: 'text' },
        this.getAttributeByOrder(sortedAttributes, 2)
      );
      this.setCellValue(
        { cell: `${cols.attribute_3}${row}`, type: 'text' },
        this.getAttributeByOrder(sortedAttributes, 3)
      );
      this.setCellValue(
        { cell: `${cols.attribute_4}${row}`, type: 'text' },
        this.getAttributeByOrder(sortedAttributes, 4)
      );
    });

    console.log(`[ExcelTemplateEngine] Populated ${balloons.length} balloons starting from row ${startRow}`);
  }

  /**
   * Ottieni attributo per ordine
   */
  private getAttributeByOrder(attributes: any[], order: number): string {
    const attribute = attributes.find(attr => attr.order === order);
    return attribute?.attributeValue || '';
  }

  /**
   * Conta i modelli nel worksheet
   */
  private getModelsCount(): number {
    // Logica per contare le righe utilizzate nella sezione modelli
    // Per semplicità, assumiamo un massimo di 50 righe da controllare
    const startRow = this.template.coordinates.models_start_row;
    const idColumn = this.template.coordinates.models_columns.id;
    
    let count = 0;
    for (let row = startRow; row < startRow + 50; row++) {
      const cellAddress = `${idColumn}${row}`;
      if (this.worksheet[cellAddress] && this.worksheet[cellAddress].v) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }

  /**
   * Converte tipo coordinate in tipo Excel
   */
  private getExcelType(type: string): string {
    switch (type) {
      case 'number': return 'n';
      case 'date': return 'd';
      case 'formula': return 'f';
      default: return 's'; // string
    }
  }

  /**
   * Genera il file Excel
   */
  generateFile(filename: string): void {
    try {
      XLSX.writeFile(this.workbook, filename);
      console.log(`[ExcelTemplateEngine] File generated: ${filename}`);
    } catch (error) {
      console.error('[ExcelTemplateEngine] Error generating file:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  /**
   * Ottieni il workbook per ulteriori manipolazioni
   */
  getWorkbook(): XLSX.WorkBook {
    return this.workbook;
  }
}

export default ExcelTemplateEngine;