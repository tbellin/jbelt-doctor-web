// app/config/excel-coordinates.ts
export interface ExcelCoordinate {
  cell: string;
  type: 'text' | 'number' | 'date' | 'formula';
  format?: string;
}

export interface ExcelTemplate {
  name: string;
  version: string;
  coordinates: {
    // Header Information
    drawing_name: ExcelCoordinate;
    drawing_code: ExcelCoordinate;
    sheet_name: ExcelCoordinate;
    sheet_id: ExcelCoordinate;
    sheet_creo_id: ExcelCoordinate;
    export_date: ExcelCoordinate;
    
    // Models Section
    models_start_row: number;
    models_columns: {
      id: string;
      name: string;
      code: string;
      type: string;
    };
    
    // Balloons Section
    balloons_start_row: number;
    balloons_columns: {
      balloon_value: string;
      balloon_creo_id: string;
      note_value: string;
      note_creo_id: string;
      attribute_1: string;
      attribute_2: string;
      attribute_3: string;
      attribute_4: string;
    };
  };
}

export const TEMPLATE_01: ExcelTemplate = {
  name: "Technical Drawing Export v1",
  version: "1.0.0",
  coordinates: {
    // Header cells - posizioni fisse nel template
    drawing_name: { cell: "J2", type: "text" },
    drawing_code: { cell: "Z1", type: "text" },
    sheet_name: { cell: "AA2", type: "text" },
    sheet_id: { cell: "AA3", type: "number" },
    sheet_creo_id: { cell: "AA6", type: "text" },
    export_date: { cell: "AA7", type: "date", format: "dd/mm/yyyy hh:mm" },
    
    // Models section - starting from row 10
    models_start_row: 10,
    models_columns: {
      id: "AB",       // Column A
      name: "AC",     // Column B  
      code: "AD",     // Column C
      type: "AE"      // Column D
    },
    
    // Balloons section - starting from row 20 (will be calculated dynamically)
    balloons_start_row: 10,
    balloons_columns: {
      balloon_value: "E",    // Column A
      balloon_creo_id: "AH",  // Column B
      note_value: "AH",       // Column C
      note_creo_id: "AH",     // Column D
      attribute_1: "E",      // Column E
      attribute_2: "F",      // Column F
      attribute_3: "G",      // Column G
      attribute_4: "H"       // Column H
    }
  }
};

export const TEMPLATE_TECHNICAL: ExcelTemplate = {
  name: "Advanced Technical Template",
  version: "1.1.0",
  coordinates: {
    // Different layout for advanced template
    drawing_name: { cell: "C3", type: "text" },
    drawing_code: { cell: "C4", type: "text" },
    sheet_name: { cell: "C5", type: "text" },
    sheet_id: { cell: "C6", type: "number" },
    sheet_creo_id: { cell: "C7", type: "text" },
    export_date: { cell: "C8", type: "date", format: "dd/mm/yyyy" },
    
    models_start_row: 12,
    models_columns: {
      id: "B",
      name: "C",
      code: "D", 
      type: "E"
    },
    
    balloons_start_row: 25,
    balloons_columns: {
      balloon_value: "B",
      balloon_creo_id: "C",
      note_value: "D",
      note_creo_id: "E",
      attribute_1: "F",
      attribute_2: "G", 
      attribute_3: "H",
      attribute_4: "I"
    }
  }
};

// Export available templates
export const AVAILABLE_TEMPLATES = {
  'template-01': TEMPLATE_01,
  'template-technical': TEMPLATE_TECHNICAL
};

export default TEMPLATE_01;