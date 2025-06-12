import { type IArchive } from './archive.model';
import { type IModelVersion } from './model-version.model';
import { type IItem } from './item.model';
import { type ISheet } from './sheet.model';
import { type ModelType } from './enumerations/model-type.model';
import { type InstanceType } from './enumerations/instance-type.model';
export interface IModel {
  id?: number;
  code?: string | null;
  name?: string | null;
  modelType?: keyof typeof ModelType | null;
  instanceType?: keyof typeof InstanceType | null;
  file?: IArchive | null;
  version?: IModelVersion | null;
  item?: IItem | null;
  generic?: IModel | null;
  parent?: IModel | null;
  sheets?: ISheet[] | null;
  
  // Data completeness indicators
  isComplete?: boolean;
  missingFields?: string[];
  isPartialFromAssociation?: boolean;
}

export class Model implements IModel {
  public isComplete?: boolean;
  public missingFields?: string[];
  public isPartialFromAssociation?: boolean;

  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public modelType?: keyof typeof ModelType | null,
    public instanceType?: keyof typeof InstanceType | null,
    public file?: IArchive | null,
    public version?: IModelVersion | null,
    public item?: IItem | null,
    public generic?: IModel | null,
    public parent?: IModel | null,
    public sheets?: ISheet[] | null,
  ) {
    this.validateCompleteness();
  }

  /**
   * Validates if the model object has all essential fields for a complete model
   * Returns true if model is complete, false if it's partial (from association)
   */
  public validateCompleteness(): boolean {
    const requiredFields = ['id', 'code', 'name', 'modelType', 'instanceType'];
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
   * Checks if this model is suitable for API update operations
   * @returns true if model can be safely sent to backend
   */
  public isValidForUpdate(): boolean {
    // Must have ID for updates
    if (!this.id || typeof this.id !== 'number') {
      return false;
    }
    
    // For updates, we accept partial objects if they have ID
    // The enrichment process will complete them
    return true;
  }

  /**
   * Checks if this model is suitable for API create operations
   * @returns true if model can be safely sent to backend for creation
   */
  public isValidForCreate(): boolean {
    // For creation, we need at least code, name, and modelType
    const requiredForCreate = ['code', 'name', 'modelType'];
    
    for (const field of requiredForCreate) {
      const value = (this as any)[field];
      if (!value || value === null || value === '') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Returns a clean object suitable for API operations (removes circular references)
   * @param includeAssociations - whether to include sheets array (default: false)
   */
  public toCleanObject(includeAssociations: boolean = false): any {
    const cleanObj: any = {
      id: this.id,
      code: this.code,
      name: this.name,
      modelType: this.modelType,
      instanceType: this.instanceType,
      file: this.file,
      version: this.version,
      item: this.item,
      generic: this.generic,
      parent: this.parent
    };
    
    // Only include sheets if explicitly requested (avoid circular refs)
    if (includeAssociations && this.sheets) {
      cleanObj.sheets = this.sheets;
    }
    
    return cleanObj;
  }

  /**
   * Creates a debug-friendly representation of the model
   */
  public getDebugInfo(): string {
    return `Model[${this.id}]: ${this.code} - ${this.name} (${this.modelType}) ` +
           `[Complete: ${this.isComplete}, Partial: ${this.isPartialFromAssociation}` +
           `${this.missingFields?.length ? `, Missing: ${this.missingFields.join(', ')}` : ''}]`;
  }

  /**
   * Static method to create a Model instance and validate it
   */
  static createAndValidate(data: Partial<IModel>): Model {
    const model = new Model(
      data.id,
      data.code,
      data.name,
      data.modelType,
      data.instanceType,
      data.file,
      data.version,
      data.item,
      data.generic,
      data.parent,
      data.sheets
    );
    
    console.log(`[Model] Created: ${model.getDebugInfo()}`);
    return model;
  }
}
