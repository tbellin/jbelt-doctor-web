import { type IArchive } from './archive.model';

export interface IMarker {
  id?: number;
  code?: string | null;
  name?: string | null;
  symbolName?: string | null;
  file?: IArchive | null;
  
  // Data completeness indicators
  isComplete?: boolean;
  missingFields?: string[];
  isPartialFromAssociation?: boolean;
}

export class Marker implements IMarker {
  public isComplete?: boolean;
  public missingFields?: string[];
  public isPartialFromAssociation?: boolean;

  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public symbolName?: string | null,
    public file?: IArchive | null,
  ) {
    this.validateCompleteness();
  }

  /**
   * Validates if the marker object has all essential fields for a complete marker
   * Returns true if marker is complete, false if it's partial (from association)
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
    
    this.missingFields = missingFields;
    this.isComplete = missingFields.length === 0;
    
    // If we have an ID but missing other fields, likely from association
    this.isPartialFromAssociation = !!(this.id && missingFields.length > 0);
    
    return this.isComplete;
  }

  /**
   * Checks if this marker is suitable for API update operations
   * @returns true if marker can be safely sent to backend
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
   * Checks if this marker is suitable for API create operations
   * @returns true if marker can be safely sent to backend for creation
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
      symbolName: this.symbolName,
      file: this.file
    };
  }

  /**
   * Creates a debug-friendly representation of the marker
   */
  public getDebugInfo(): string {
    return `Marker[${this.id}]: ${this.code} - ${this.name} (${this.symbolName}) ` +
           `[Complete: ${this.isComplete}, Partial: ${this.isPartialFromAssociation}` +
           `${this.missingFields?.length ? `, Missing: ${this.missingFields.join(', ')}` : ''}]`;
  }

  /**
   * Returns the display name for the marker
   */
  public getDisplayName(): string {
    if (this.name && this.code) {
      return `${this.code} - ${this.name}`;
    } else if (this.name) {
      return this.name;
    } else if (this.code) {
      return this.code;
    }
    return `Marker ${this.id || 'Unknown'}`;
  }

  /**
   * Static method to create a Marker instance and validate it
   */
  static createAndValidate(data: Partial<IMarker>): Marker {
    const marker = new Marker(
      data.id,
      data.code,
      data.name,
      data.symbolName,
      data.file
    );
    
    console.log(`[Marker] Created: ${marker.getDebugInfo()}`);
    return marker;
  }
}
