import { type TypeValue } from './enumerations/type-value.model';

export interface IPosition {
  id?: number;
  code?: string | null;
  name?: string | null;
  typeValue?: keyof typeof TypeValue | null;
  attributeValue?: string | null;
  posX?: number | null;
  posY?: number | null;
  posZ?: number | null;
  box?: string | null;
  
  // Data completeness indicators
  isComplete?: boolean;
  missingFields?: string[];
  isPartialFromAssociation?: boolean;
}

export class Position implements IPosition {
  public isComplete?: boolean;
  public missingFields?: string[];
  public isPartialFromAssociation?: boolean;

  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public typeValue?: keyof typeof TypeValue | null,
    public attributeValue?: string | null,
    public posX?: number | null,
    public posY?: number | null,
    public posZ?: number | null,
    public box?: string | null,
  ) {
    this.validateCompleteness();
  }

  /**
   * Validates if the position object has all essential fields for a complete position
   * Returns true if position is complete, false if it's partial (from association)
   */
  public validateCompleteness(): boolean {
    const requiredFields = ['id', 'code', 'name'];
    const missingFields: string[] = [];
    
    // Check for required fields
    for (const field of requiredFields) {
      const value = (this as any)[field];
      if (value === null || value === undefined || value === '') {
        missingFields.push(field);
      }
    }
    
    // Check for coordinate completeness - at least one coordinate should be set
    if (this.posX === null && this.posY === null && this.posZ === null) {
      missingFields.push('coordinates');
    }
    
    this.missingFields = missingFields;
    this.isComplete = missingFields.length === 0;
    
    // If we have an ID but missing other fields, likely from association
    this.isPartialFromAssociation = !!(this.id && missingFields.length > 0);
    
    return this.isComplete;
  }

  /**
   * Checks if this position is suitable for API update operations
   * @returns true if position can be safely sent to backend
   */
  public isValidForUpdate(): boolean {
    // Must have ID for updates
    if (!this.id || typeof this.id !== 'number') {
      return false;
    }
    
    // For updates, we accept partial objects if they have ID
    return true;
  }

  /**
   * Checks if this position is suitable for API create operations
   * @returns true if position can be safely sent to backend for creation
   */
  public isValidForCreate(): boolean {
    // For creation, we need at least code and name
    const requiredForCreate = ['code', 'name'];
    
    for (const field of requiredForCreate) {
      const value = (this as any)[field];
      if (!value || value === null || value === '') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Returns a clean object suitable for API operations
   */
  public toCleanObject(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      typeValue: this.typeValue,
      attributeValue: this.attributeValue,
      posX: this.posX,
      posY: this.posY,
      posZ: this.posZ,
      box: this.box
    };
  }

  /**
   * Creates a debug-friendly representation of the position
   */
  public getDebugInfo(): string {
    return `Position[${this.id}]: ${this.code} - ${this.name} (${this.getCoordinatesString()}) ` +
           `[Complete: ${this.isComplete}, Partial: ${this.isPartialFromAssociation}` +
           `${this.missingFields?.length ? `, Missing: ${this.missingFields.join(', ')}` : ''}]`;
  }

  /**
   * Returns the coordinates as a formatted string
   */
  public getCoordinatesString(): string {
    const coords: string[] = [];
    if (this.posX !== null && this.posX !== undefined) coords.push(`X:${this.posX}`);
    if (this.posY !== null && this.posY !== undefined) coords.push(`Y:${this.posY}`);
    if (this.posZ !== null && this.posZ !== undefined) coords.push(`Z:${this.posZ}`);
    return coords.length > 0 ? coords.join(', ') : 'No coordinates';
  }

  /**
   * Checks if the position has valid coordinates
   */
  public hasValidCoordinates(): boolean {
    return this.posX !== null || this.posY !== null || this.posZ !== null;
  }

  /**
   * Returns the position as a 3D vector (with defaults for missing coordinates)
   */
  public toVector3D(): { x: number; y: number; z: number } {
    return {
      x: this.posX ?? 0,
      y: this.posY ?? 0,
      z: this.posZ ?? 0
    };
  }

  /**
   * Static method to create a Position instance and validate it
   */
  static createAndValidate(data: Partial<IPosition>): Position {
    const position = new Position(
      data.id,
      data.code,
      data.name,
      data.typeValue,
      data.attributeValue,
      data.posX,
      data.posY,
      data.posZ,
      data.box
    );
    
    console.log(`[Position] Created: ${position.getDebugInfo()}`);
    return position;
  }
}
