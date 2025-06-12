/**
 * Utility functions for enriching partial objects with complete data
 * Solves the problem of partial objects returned by backend associations
 */

import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { Model } from '~/model/model.model'
import { Sheet } from '~/model/sheet.model'

/**
 * Enriches a partial model object with complete data from available models
 * @param partialModel - Partial model object from backend association
 * @param availableModels - Complete model objects to use as reference
 * @returns Complete model object or the original if not found
 */
export function enrichPartialModel(
  partialModel: Partial<IModel>,
  availableModels: IModel[]
): IModel {
  if (!partialModel.id) {
    console.warn('[ObjectEnrichment] Cannot enrich model without ID:', partialModel)
    return partialModel as IModel
  }

  // Create Model instance to check completeness
  const modelInstance = Model.createAndValidate(partialModel)
  
  // If model is already complete, return it
  if (modelInstance.isComplete) {
    console.log(`[ObjectEnrichment] Model ${partialModel.id} is already complete`)
    return modelInstance.toCleanObject()
  }
  
  // If partial, try to enrich with complete data
  if (modelInstance.isPartialFromAssociation) {
    console.log(`[ObjectEnrichment] Model ${partialModel.id} is partial from association, enriching...`)
    
    const completeModel = availableModels.find(model => model.id === partialModel.id)
    
    if (completeModel) {
      console.log(`[ObjectEnrichment] ✅ Found complete data for model ${partialModel.id}`)
      const enrichedModel = Model.createAndValidate(completeModel)
      return enrichedModel.toCleanObject()
    } else {
      console.warn(`[ObjectEnrichment] ❌ Complete model not found for ID ${partialModel.id}`);
      console.warn(`[ObjectEnrichment] Missing fields: ${modelInstance.missingFields?.join(', ')}`);
    }
  }
  
  return modelInstance.toCleanObject()
}

/**
 * Enriches a partial sheet object with complete data from available sheets
 * @param partialSheet - Partial sheet object from backend association  
 * @param availableSheets - Complete sheet objects to use as reference
 * @param availableModels - Complete model objects for association enrichment
 * @returns Complete sheet object or the original if not found
 */
export function enrichPartialSheet(
  partialSheet: Partial<ISheet>,
  availableSheets: ISheet[],
  availableModels?: IModel[]
): ISheet {
  if (!partialSheet.id) {
    console.warn('[ObjectEnrichment] Cannot enrich sheet without ID:', partialSheet)
    return partialSheet as ISheet
  }

  // Create Sheet instance to check completeness
  const sheetInstance = Sheet.createAndValidate(partialSheet)
  
  // If sheet is already complete and has no partial associations, return it
  if (sheetInstance.isComplete && !sheetInstance.hasPartialAssociations) {
    console.log(`[ObjectEnrichment] Sheet ${partialSheet.id} is already complete`)
    return sheetInstance.toCleanObject(true)
  }
  
  // If partial or has partial associations, try to enrich
  if (sheetInstance.isPartialFromAssociation || sheetInstance.hasPartialAssociations) {
    console.log(`[ObjectEnrichment] Sheet ${partialSheet.id} needs enrichment...`)
    
    // Find complete sheet data first
    const completeSheet = availableSheets.find(sheet => sheet.id === partialSheet.id)
    
    if (completeSheet) {
      console.log(`[ObjectEnrichment] ✅ Found complete data for sheet ${partialSheet.id}`)
      const enrichedSheet = Sheet.createAndValidate(completeSheet)
      
      // If we have available models, enrich the associations too
      if (availableModels && availableModels.length > 0) {
        enrichedSheet.enrichWithCompleteData(availableModels)
      }
      
      return enrichedSheet.toCleanObject(true)
    } else {
      console.warn(`[ObjectEnrichment] ❌ Complete sheet not found for ID ${partialSheet.id}`);
      console.warn(`[ObjectEnrichment] Missing fields: ${sheetInstance.missingFields?.join(', ')}`);
      
      // Still try to enrich associations if we have models
      if (availableModels && availableModels.length > 0) {
        sheetInstance.enrichWithCompleteData(availableModels)
      }
    }
  }
  
  return sheetInstance.toCleanObject(true)
}

/**
 * Enriches an array of partial models with complete data
 * @param partialModels - Array of partial model objects
 * @param availableModels - Complete model objects to use as reference
 * @returns Array of enriched complete model objects
 */
export function enrichPartialModels(
  partialModels: Partial<IModel>[],
  availableModels: IModel[]
): IModel[] {
  return partialModels.map(partial => enrichPartialModel(partial, availableModels))
}

/**
 * Enriches an array of partial sheets with complete data
 * @param partialSheets - Array of partial sheet objects
 * @param availableSheets - Complete sheet objects to use as reference  
 * @param availableModels - Complete model objects for association enrichment
 * @returns Array of enriched complete sheet objects
 */
export function enrichPartialSheets(
  partialSheets: Partial<ISheet>[],
  availableSheets: ISheet[],
  availableModels?: IModel[]
): ISheet[] {
  return partialSheets.map(partial => enrichPartialSheet(partial, availableSheets, availableModels))
}

/**
 * Creates a clean model object for API updates, ensuring all required fields are present
 * @param model - Model object to clean
 * @returns Clean model object suitable for API updates
 */
export function createCleanModelForUpdate(model: IModel): any {
  return {
    id: model.id,
    code: model.code || null,
    name: model.name || null,
    modelType: model.modelType || 'PART',
    instanceType: model.instanceType || 'NORMAL',
    file: model.file || null,
    version: model.version || null,
    item: model.item || null,
    generic: model.generic || null,
    parent: model.parent || null
    // Explicitly exclude 'sheets' to prevent circular references
  }
}

/**
 * Creates a clean sheet object for API updates, ensuring all required fields are present
 * @param sheet - Sheet object to clean
 * @returns Clean sheet object suitable for API updates
 */
export function createCleanSheetForUpdate(sheet: ISheet): any {
  return {
    id: sheet.id,
    creoId: sheet.creoId || null,
    code: sheet.code || null,
    name: sheet.name || null,
    formatType: sheet.formatType || null,
    format: sheet.format || null,
    drawing: sheet.drawing || null
    // Explicitly exclude 'models' - will be added separately to prevent circular references
  }
}

/**
 * Validates that an object has the required ID field for backend operations
 * Uses the new validation methods from Model/Sheet classes
 * @param obj - Object to validate
 * @param objectType - Type description for logging  
 * @param operation - 'create' or 'update' operation type
 * @returns True if object is valid for the operation
 */
export function validateObjectForUpdate(obj: any, objectType: string, operation: 'create' | 'update' = 'update'): boolean {
  if (!obj) {
    console.error(`[ObjectEnrichment] ${objectType} object is null/undefined`)
    return false
  }
  
  // Try to use the class validation methods if available
  if (typeof obj.isValidForUpdate === 'function' && operation === 'update') {
    const isValid = obj.isValidForUpdate()
    if (!isValid) {
      console.error(`[ObjectEnrichment] ${objectType} failed validation for update:`, obj.getDebugInfo?.() || obj)
    }
    return isValid
  }
  
  if (typeof obj.isValidForCreate === 'function' && operation === 'create') {
    const isValid = obj.isValidForCreate()
    if (!isValid) {
      console.error(`[ObjectEnrichment] ${objectType} failed validation for create:`, obj.getDebugInfo?.() || obj)
    }
    return isValid
  }
  
  // Fallback to basic ID validation for update operations
  if (operation === 'update') {
    if (!obj.id) {
      console.error(`[ObjectEnrichment] ${objectType} object missing required ID for update:`, obj)
      return false
    }
    
    if (typeof obj.id !== 'number') {
      console.error(`[ObjectEnrichment] ${objectType} object ID must be a number:`, obj.id)
      return false
    }
  }
  
  return true
}

/**
 * Logs object details for debugging purposes
 * Uses the new debug methods from Model/Sheet classes when available
 * @param obj - Object to log
 * @param label - Label for the log entry
 */
export function debugLogObject(obj: any, label: string): void {
  if (process.env.NODE_ENV === 'development') {
    // Use class debug methods if available
    if (typeof obj.getDebugInfo === 'function') {
      console.log(`[ObjectEnrichment] ${label}: ${obj.getDebugInfo()}`)
      return
    }
    
    // Fallback to basic object info
    console.log(`[ObjectEnrichment] ${label}:`, {
      id: obj?.id,
      code: obj?.code,
      name: obj?.name,
      type: obj?.modelType || obj?.formatType || 'unknown',
      isComplete: obj?.isComplete,
      isPartial: obj?.isPartialFromAssociation,
      missingFields: obj?.missingFields,
      hasCircularRefs: !!(obj?.sheets || obj?.models)
    })
  }
}