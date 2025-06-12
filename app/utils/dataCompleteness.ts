/**
 * Utility functions for diagnosing and reporting data completeness issues
 * Helps identify when objects are partial vs complete for debugging
 */

import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { Model } from '~/model/model.model'
import { Sheet } from '~/model/sheet.model'

export interface CompletenessReport {
  totalObjects: number
  completeObjects: number
  partialObjects: number
  invalidObjects: number
  issues: string[]
  details: Array<{
    id: number | undefined
    type: 'Model' | 'Sheet'
    status: 'Complete' | 'Partial' | 'Invalid'
    missingFields: string[]
    debugInfo: string
  }>
}

/**
 * Analyzes an array of models for completeness issues
 * @param models - Array of model objects to analyze
 * @returns Detailed completeness report
 */
export function analyzeModelsCompleteness(models: any[]): CompletenessReport {
  const report: CompletenessReport = {
    totalObjects: models.length,
    completeObjects: 0,
    partialObjects: 0,
    invalidObjects: 0,
    issues: [],
    details: []
  }

  for (const modelData of models) {
    try {
      const model = Model.createAndValidate(modelData)
      
      let status: 'Complete' | 'Partial' | 'Invalid' = 'Invalid'
      
      if (model.isComplete) {
        status = 'Complete'
        report.completeObjects++
      } else if (model.isPartialFromAssociation) {
        status = 'Partial'
        report.partialObjects++
        report.issues.push(`Model ${model.id}: Partial object from association (missing: ${model.missingFields?.join(', ')})`)
      } else {
        status = 'Invalid'
        report.invalidObjects++
        report.issues.push(`Model ${model.id}: Invalid object (missing: ${model.missingFields?.join(', ')})`)
      }
      
      report.details.push({
        id: model.id,
        type: 'Model',
        status,
        missingFields: model.missingFields || [],
        debugInfo: model.getDebugInfo()
      })
      
    } catch (error) {
      report.invalidObjects++
      report.issues.push(`Model ${modelData?.id}: Error creating instance - ${error}`)
      
      report.details.push({
        id: modelData?.id,
        type: 'Model',
        status: 'Invalid',
        missingFields: ['Error during validation'],
        debugInfo: `Error: ${error}`
      })
    }
  }

  return report
}

/**
 * Analyzes an array of sheets for completeness issues
 * @param sheets - Array of sheet objects to analyze
 * @returns Detailed completeness report
 */
export function analyzeSheetsCompleteness(sheets: any[]): CompletenessReport {
  const report: CompletenessReport = {
    totalObjects: sheets.length,
    completeObjects: 0,
    partialObjects: 0,
    invalidObjects: 0,
    issues: [],
    details: []
  }

  for (const sheetData of sheets) {
    try {
      const sheet = Sheet.createAndValidate(sheetData)
      
      let status: 'Complete' | 'Partial' | 'Invalid' = 'Invalid'
      
      if (sheet.isComplete && !sheet.hasPartialAssociations) {
        status = 'Complete'
        report.completeObjects++
      } else if (sheet.isPartialFromAssociation || sheet.hasPartialAssociations) {
        status = 'Partial'
        report.partialObjects++
        
        let issues: string[] = []
        if (sheet.missingFields?.length) {
          issues.push(`missing fields: ${sheet.missingFields.join(', ')}`)
        }
        if (sheet.hasPartialAssociations) {
          issues.push('has partial associations')
        }
        
        report.issues.push(`Sheet ${sheet.id}: Partial object (${issues.join(', ')})`)
      } else {
        status = 'Invalid'
        report.invalidObjects++
        report.issues.push(`Sheet ${sheet.id}: Invalid object (missing: ${sheet.missingFields?.join(', ')})`)
      }
      
      report.details.push({
        id: sheet.id,
        type: 'Sheet',
        status,
        missingFields: sheet.missingFields || [],
        debugInfo: sheet.getDebugInfo()
      })
      
    } catch (error) {
      report.invalidObjects++
      report.issues.push(`Sheet ${sheetData?.id}: Error creating instance - ${error}`)
      
      report.details.push({
        id: sheetData?.id,
        type: 'Sheet',
        status: 'Invalid',
        missingFields: ['Error during validation'],
        debugInfo: `Error: ${error}`
      })
    }
  }

  return report
}

/**
 * Combines and formats multiple completeness reports
 * @param reports - Array of completeness reports
 * @returns Combined formatted report
 */
export function formatCompletenessReports(...reports: CompletenessReport[]): string {
  const combined = reports.reduce((acc, report) => ({
    totalObjects: acc.totalObjects + report.totalObjects,
    completeObjects: acc.completeObjects + report.completeObjects,
    partialObjects: acc.partialObjects + report.partialObjects,
    invalidObjects: acc.invalidObjects + report.invalidObjects,
    issues: [...acc.issues, ...report.issues],
    details: [...acc.details, ...report.details]
  }), {
    totalObjects: 0,
    completeObjects: 0,
    partialObjects: 0,
    invalidObjects: 0,
    issues: [],
    details: []
  })

  const completePercent = combined.totalObjects > 0 
    ? Math.round((combined.completeObjects / combined.totalObjects) * 100) 
    : 0

  let output = `\n📊 DATA COMPLETENESS REPORT\n`
  output += `${'='.repeat(50)}\n`
  output += `Total Objects: ${combined.totalObjects}\n`
  output += `✅ Complete: ${combined.completeObjects} (${completePercent}%)\n`
  output += `⚠️  Partial: ${combined.partialObjects}\n`
  output += `❌ Invalid: ${combined.invalidObjects}\n\n`

  if (combined.issues.length > 0) {
    output += `🔍 ISSUES FOUND:\n`
    for (const issue of combined.issues.slice(0, 10)) { // Limit to first 10 issues
      output += `   • ${issue}\n`
    }
    if (combined.issues.length > 10) {
      output += `   ... and ${combined.issues.length - 10} more issues\n`
    }
    output += `\n`
  }

  // Group details by status
  const completeObjects = combined.details.filter(d => d.status === 'Complete')
  const partialObjects = combined.details.filter(d => d.status === 'Partial')
  const invalidObjects = combined.details.filter(d => d.status === 'Invalid')

  if (partialObjects.length > 0) {
    output += `⚠️  PARTIAL OBJECTS (${partialObjects.length}):\n`
    for (const obj of partialObjects.slice(0, 5)) { // Show first 5
      output += `   ${obj.debugInfo}\n`
    }
    if (partialObjects.length > 5) {
      output += `   ... and ${partialObjects.length - 5} more partial objects\n`
    }
    output += `\n`
  }

  if (invalidObjects.length > 0) {
    output += `❌ INVALID OBJECTS (${invalidObjects.length}):\n`
    for (const obj of invalidObjects.slice(0, 3)) { // Show first 3
      output += `   ${obj.debugInfo}\n`
    }
    if (invalidObjects.length > 3) {
      output += `   ... and ${invalidObjects.length - 3} more invalid objects\n`
    }
  }

  return output
}

/**
 * Quick diagnostic function for API responses
 * @param apiResponse - API response data
 * @param dataType - Type of data ('models' or 'sheets')
 * @returns Formatted completeness report
 */
export function diagnoseApiResponse(apiResponse: any, dataType: 'models' | 'sheets'): string {
  if (!Array.isArray(apiResponse)) {
    return `❌ API response is not an array: ${typeof apiResponse}`
  }

  const report = dataType === 'models' 
    ? analyzeModelsCompleteness(apiResponse)
    : analyzeSheetsCompleteness(apiResponse)

  return formatCompletenessReports(report)
}

/**
 * Logs completeness analysis to console
 * @param data - Data to analyze
 * @param dataType - Type of data
 * @param label - Label for the log
 */
export function logCompletenessAnalysis(data: any[], dataType: 'models' | 'sheets', label: string): void {
  console.group(`🔍 [DataCompleteness] ${label}`)
  
  const report = dataType === 'models' 
    ? analyzeModelsCompleteness(data)
    : analyzeSheetsCompleteness(data)
    
  console.log(formatCompletenessReports(report))
  
  // Log detailed debug info for partial/invalid objects
  const problematicObjects = report.details.filter(d => d.status !== 'Complete')
  if (problematicObjects.length > 0) {
    console.group('📋 Detailed Object Analysis')
    for (const obj of problematicObjects) {
      console.log(`${obj.type}[${obj.id}] - Status: ${obj.status}`)
      if (obj.missingFields.length > 0) {
        console.log(`   Missing: ${obj.missingFields.join(', ')}`)
      }
    }
    console.groupEnd()
  }
  
  console.groupEnd()
}

/**
 * Creates a summary for the UI showing data completeness issues
 * @param modelsData - Models data from API
 * @param sheetsData - Sheets data from API
 * @returns Object with summary info for UI display
 */
export function createCompletnessSummaryForUI(modelsData: any[], sheetsData: any[]) {
  const modelsReport = analyzeModelsCompleteness(modelsData)
  const sheetsReport = analyzeSheetsCompleteness(sheetsData)
  
  return {
    models: {
      total: modelsReport.totalObjects,
      complete: modelsReport.completeObjects,
      partial: modelsReport.partialObjects,
      invalid: modelsReport.invalidObjects,
      completenessPercent: modelsReport.totalObjects > 0 
        ? Math.round((modelsReport.completeObjects / modelsReport.totalObjects) * 100) 
        : 0
    },
    sheets: {
      total: sheetsReport.totalObjects,
      complete: sheetsReport.completeObjects,
      partial: sheetsReport.partialObjects,
      invalid: sheetsReport.invalidObjects,
      completenessPercent: sheetsReport.totalObjects > 0 
        ? Math.round((sheetsReport.completeObjects / sheetsReport.totalObjects) * 100) 
        : 0
    },
    totalIssues: modelsReport.issues.length + sheetsReport.issues.length,
    criticalIssues: modelsReport.invalidObjects + sheetsReport.invalidObjects
  }
}