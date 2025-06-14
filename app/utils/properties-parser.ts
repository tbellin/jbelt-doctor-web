// app/utils/properties-parser.ts

export interface ExcelProperties {
  templateFile: string;
  coordinates: {
    drawing_name: string;
    model_name: string;
    balloon_value: string;
    attribute1_value: string;
    attribute2_value: string;
    attribute3_value: string;
    attribute4_value: string;
  };
}

export class PropertiesParser {
  /**
   * Carica e parsifica il file excel.properties
   */
  static async loadProperties(propertiesPath: string = '/excel.properties'): Promise<ExcelProperties> {
    try {
      console.log('[PropertiesParser] Attempting to load properties from:', propertiesPath);
      
      const response = await fetch(propertiesPath);
      console.log('[PropertiesParser] Fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to load properties: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log('[PropertiesParser] Properties content loaded, length:', content.length);
      console.log('[PropertiesParser] Properties content preview:', content.substring(0, 200));
      
      return this.parseProperties(content);
      
    } catch (error) {
      console.error('[PropertiesParser] ❌ Error loading properties:', error);
      console.warn('[PropertiesParser] ⚠️ Using DEFAULT properties instead!');
      // Fallback to default configuration
      return this.getDefaultProperties();
    }
  }

  /**
   * Parsifica il contenuto del file properties
   */
  private static parseProperties(content: string): ExcelProperties {
    const lines = content.split('\n');
    const props: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        continue;
      }

      // Parse key=value pairs
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        props[key] = value;
      }
    }

    console.log('[PropertiesParser] Parsed properties:', props);

    // Build configuration object
    const config: ExcelProperties = {
      templateFile: props['TEMPLATE_FILE'] || 'template-01.xlsx',
      coordinates: {
        drawing_name: props['DRAWING_NAME'] || 'J2',
        model_name: props['MODEL_NAME'] || 'J4',
        balloon_value: this.extractBaseCoordinate(props['BALLOON_VALUE+'] || 'A7'),
        attribute1_value: this.extractBaseCoordinate(props['ATTRIBUTE1_VALUE+'] || 'B7'),
        attribute2_value: this.extractBaseCoordinate(props['ATTRIBUTE2_VALUE+'] || 'C7'),
        attribute3_value: this.extractBaseCoordinate(props['ATTRIBUTE3_VALUE+'] || 'D7'),
        attribute4_value: this.extractBaseCoordinate(props['ATTRIBUTE4_VALUE+'] || 'E7')
      }
    };

    return config;
  }

  /**
   * Estrae la coordinata base rimuovendo il + finale se presente
   */
  private static extractBaseCoordinate(coord: string): string {
    return coord.replace(/\+$/, '');
  }

  /**
   * Configurazione di default se il file properties non è disponibile
   * EMBEDDED: Queste sono le coordinate dal file excel.properties
   */
  private static getDefaultProperties(): ExcelProperties {
    console.log('[PropertiesParser] ⚠️ Using EMBEDDED default properties (excel.properties not loaded)');
    
    // Configurazione embedded dal file excel.properties
    return {
      templateFile: 'template-01.xlsx',
      coordinates: {
        drawing_name: 'J2',        // DRAWING_NAME=J2
        model_name: 'J4',          // MODEL_NAME=J4  
        balloon_value: 'A7',       // BALLOON_VALUE+=A7
        attribute1_value: 'B7',    // ATTRIBUTE1_VALUE+=B7
        attribute2_value: 'C7',    // ATTRIBUTE2_VALUE+=C7
        attribute3_value: 'D7',    // ATTRIBUTE3_VALUE+=D7
        attribute4_value: 'E7'     // ATTRIBUTE4_VALUE+=E7
      }
    };
  }

  /**
   * Calcola la coordinata per una riga specifica
   */
  static getCoordinateForRow(baseCoordinate: string, rowOffset: number): string {
    // Estrae colonna e riga dalla coordinata (es. "A10" -> colonna="A", riga=10)
    const match = baseCoordinate.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid coordinate format: ${baseCoordinate}`);
    }

    const column = match[1];
    const baseRow = parseInt(match[2]);
    const newRow = baseRow + rowOffset;

    return `${column}${newRow}`;
  }
}

export default PropertiesParser;