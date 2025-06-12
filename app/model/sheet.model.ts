import { type IFormat } from './format.model';
import { type IModel } from './model.model';
import { type DIN } from './enumerations/din.model';
export interface ISheet {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  formatType?: keyof typeof DIN | string | null;
  format?: IFormat | null;
  drawing?: IModel | null;
  models?: IModel[] | null;
  
  // Data completeness indicators
  isComplete?: boolean;
  missingFields?: string[];
  isPartialFromAssociation?: boolean;
  hasPartialAssociations?: boolean;
}

export class Sheet implements ISheet {
  public isComplete?: boolean;
  public missingFields?: string[];
  public isPartialFromAssociation?: boolean;
  public hasPartialAssociations?: boolean;

  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public formatType?: keyof typeof DIN | string | null,
    public format?: IFormat | null,
    public drawing?: IModel | null,
    public models?: IModel[] | null,
  ) {
    this.validateCompleteness();
  }

  /**
   * Validates if the sheet object has all essential fields for a complete sheet
   * Also checks if associated models/drawings are complete
   */
  public validateCompleteness(): boolean {
    const requiredFields = ['id', 'code', 'name', 'formatType'];
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
    
    // Check if associated models/drawings are partial
    this.hasPartialAssociations = this.checkPartialAssociations();
    
    return this.isComplete;
  }

  /**
   * Checks if associated models or drawings are partial objects
   */
  private checkPartialAssociations(): boolean {
    let hasPartials = false;
    
    // Check drawing
    if (this.drawing && this.drawing.id) {
      // If drawing has ID but missing essential fields, it's partial
      if (!this.drawing.code || !this.drawing.modelType) {
        hasPartials = true;
        console.warn(`[Sheet] Drawing ${this.drawing.id} appears to be partial (missing code or modelType)`);
      }
    }
    
    // Check models
    if (this.models && Array.isArray(this.models)) {
      for (const model of this.models) {
        if (model.id && (!model.code || !model.modelType)) {
          hasPartials = true;
          console.warn(`[Sheet] Model ${model.id} appears to be partial (missing code or modelType)`);
        }
      }
    }
    
    return hasPartials;
  }

  /**
   * Checks if this sheet is suitable for API update operations
   */
  public isValidForUpdate(): boolean {
    // Must have ID for updates
    if (!this.id || typeof this.id !== 'number') {
      return false;
    }
    
    // For updates, we accept sheets even with partial associations
    // The enrichment process will complete them
    return true;
  }

  /**
   * Checks if this sheet is suitable for API create operations
   */
  public isValidForCreate(): boolean {
    // For creation, we need at least code, name, and formatType
    const requiredForCreate = ['code', 'name', 'formatType'];
    
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
   * @param includeAssociations - whether to include models/drawing arrays (default: false)
   */
  public toCleanObject(includeAssociations: boolean = false): any {
    const cleanObj: any = {
      id: this.id,
      creoId: this.creoId,
      code: this.code,
      name: this.name,
      formatType: this.formatType,
      format: this.format
    };
    
    // Only include associations if explicitly requested (avoid circular refs)
    if (includeAssociations) {
      cleanObj.drawing = this.drawing;
      cleanObj.models = this.models;
    }
    
    return cleanObj;
  }

  /**
   * Gets count of associated models
   */
  public getModelCount(): number {
    return this.models?.length || 0;
  }

  /**
   * Checks if sheet has a drawing association
   */
  public hasDrawing(): boolean {
    return !!(this.drawing && this.drawing.id);
  }

  /**
   * Creates a debug-friendly representation of the sheet
   */
  public getDebugInfo(): string {
    const drawingInfo = this.hasDrawing() ? `Drawing: ${this.drawing?.id}` : 'No Drawing';
    const modelsInfo = `Models: ${this.getModelCount()}`;
    const partialInfo = this.hasPartialAssociations ? ' [HAS PARTIAL ASSOCIATIONS]' : '';
    
    return `Sheet[${this.id}]: ${this.code} - ${this.name} (${this.formatType}) ` +
           `[Complete: ${this.isComplete}, Partial: ${this.isPartialFromAssociation}` +
           `${this.missingFields?.length ? `, Missing: ${this.missingFields.join(', ')}` : ''}] ` +
           `${drawingInfo}, ${modelsInfo}${partialInfo}`;
  }

  /**
   * Static method to create a Sheet instance and validate it
   */
  static createAndValidate(data: Partial<ISheet>): Sheet {
    const sheet = new Sheet(
      data.id,
      data.creoId,
      data.code,
      data.name,
      data.formatType,
      data.format,
      data.drawing,
      data.models
    );
    
    console.log(`[Sheet] Created: ${sheet.getDebugInfo()}`);
    return sheet;
  }

  /**
   * Enriches this sheet with complete data from available sources
   * @param availableModels - Complete model objects for reference
   * @param availableSheets - Complete sheet objects for reference (for self-enrichment)
   */
  public enrichWithCompleteData(availableModels: IModel[], availableSheets?: ISheet[]): void {
    console.log(`[Sheet] Enriching ${this.id} with complete data...`);
    
    // Enrich drawing if partial
    if (this.drawing && this.drawing.id && (!this.drawing.code || !this.drawing.modelType)) {
      const completeDrawing = availableModels.find(m => m.id === this.drawing!.id);
      if (completeDrawing) {
        console.log(`[Sheet] Enriching partial drawing ${this.drawing.id} with complete data`);
        this.drawing = {
          id: completeDrawing.id,
          code: completeDrawing.code,
          name: completeDrawing.name,
          modelType: completeDrawing.modelType,
          instanceType: completeDrawing.instanceType,
          file: completeDrawing.file,
          version: completeDrawing.version,
          item: completeDrawing.item,
          generic: completeDrawing.generic,
          parent: completeDrawing.parent
          // Exclude sheets to avoid circular reference
        };
      }
    }
    
    // Enrich models if partial
    if (this.models && Array.isArray(this.models)) {
      this.models = this.models.map(model => {
        if (model.id && (!model.code || !model.modelType)) {
          const completeModel = availableModels.find(m => m.id === model.id);
          if (completeModel) {
            console.log(`[Sheet] Enriching partial model ${model.id} with complete data`);
            return {
              id: completeModel.id,
              code: completeModel.code,
              name: completeModel.name,
              modelType: completeModel.modelType,
              instanceType: completeModel.instanceType,
              file: completeModel.file,
              version: completeModel.version,
              item: completeModel.item,
              generic: completeModel.generic,
              parent: completeModel.parent
              // Exclude sheets to avoid circular reference
            };
          }
        }
        return model;
      });
    }
    
    // Re-validate after enrichment
    this.validateCompleteness();
    console.log(`[Sheet] After enrichment: ${this.getDebugInfo()}`);
  }
}
