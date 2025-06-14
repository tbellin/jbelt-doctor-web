// app/server/api/generateExcelDrawings.post.ts
import { promises as fs } from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import { defineEventHandler, readBody, createError } from 'h3'
import { TEMPLATE_01 } from '~/config/excel-coordinates'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const debug = config.public.debug === 'true'
    const templatePath = config.public.templatePath
    
    // Rimuovi il leading slash se presente
    const relativePath = templatePath.startsWith('/') ? templatePath.slice(1) : templatePath
    const fullPath = path.resolve(process.cwd(), 'public', relativePath)
    
    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - Template path:', templatePath)
      console.log('[DEBUG] generateExcelDrawings - Full path:', fullPath)
    }

    // Verifica se il file esiste
    try {
      await fs.access(fullPath)
    } catch (accessError) {
      if (debug) {
        console.log('[DEBUG] generateExcelDrawings - File not found:', fullPath)
      }
      throw createError({
        statusCode: 404,
        statusMessage: `Template file not found: ${relativePath}`
      })
    }

    // Legge il body della richiesta con i dati del drawing
    const requestData = await readBody(event)
    if (!requestData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required with drawing data'
      })
    }

    const { 
      drawingName = '', 
      drawingCode = '', 
      sheetName = '', 
      sheetId = '', 
      sheetCreoId = '',
      models = [],
      balloons = []
    } = requestData

    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - Request data:', {
        drawingName,
        drawingCode,
        sheetName,
        modelsCount: models.length,
        balloonsCount: balloons.length
      })
    }

    // Legge il file template
    const bufferIn = await fs.readFile(fullPath)
    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - Input file size:', bufferIn.length)
    }

    // Carica il workbook
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(bufferIn)
    
    // Verifica che ci sia almeno un foglio
    if (workbook.worksheets.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template Excel non contiene fogli di lavoro'
      })
    }
    
    const sheet = workbook.worksheets[0]

    // Usa le coordinate del template configurato
    const coordinates = TEMPLATE_01.coordinates

    // Popola le informazioni dell'header
    sheet.getCell(coordinates.drawing_name.cell).value = drawingName
    sheet.getCell(coordinates.drawing_code.cell).value = drawingCode
    sheet.getCell(coordinates.sheet_name.cell).value = sheetName
    sheet.getCell(coordinates.sheet_id.cell).value = parseInt(sheetId) || 0
    sheet.getCell(coordinates.sheet_creo_id.cell).value = sheetCreoId
    
    // Data di export con formato
    const exportDate = new Date()
    const dateCell = sheet.getCell(coordinates.export_date.cell)
    dateCell.value = exportDate
    if (coordinates.export_date.format) {
      dateCell.numFmt = coordinates.export_date.format
    }

    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - Header populated:', {
        drawing_name: coordinates.drawing_name.cell,
        drawing_code: coordinates.drawing_code.cell,
        sheet_name: coordinates.sheet_name.cell,
        export_date: coordinates.export_date.cell
      })
    }

    // Popola la sezione modelli
    if (models.length > 0) {
      let currentRow = coordinates.models_start_row
      
      models.forEach((model, index) => {
        const row = currentRow + index
        sheet.getCell(`${coordinates.models_columns.id}${row}`).value = model.id || ''
        sheet.getCell(`${coordinates.models_columns.name}${row}`).value = model.name || ''
        sheet.getCell(`${coordinates.models_columns.code}${row}`).value = model.code || ''
        sheet.getCell(`${coordinates.models_columns.type}${row}`).value = model.modelType || ''
      })
      
      if (debug) {
        console.log(`[DEBUG] generateExcelDrawings - Models populated: ${models.length} models starting from row ${coordinates.models_start_row}`)
      }
    }

    // Popola la sezione balloons
    if (balloons.length > 0) {
      // Calcola la riga di inizio balloons dinamicamente
      const balloonsStartRow = coordinates.balloons_start_row + Math.max(0, models.length)
      
      balloons.forEach((balloonData, index) => {
        const row = balloonsStartRow + index
        const { balloon, note, attributes } = balloonData
        
        // Balloon data
        sheet.getCell(`${coordinates.balloons_columns.balloon_value}${row}`).value = 
          balloon?.baloonValue || balloon?.creoId || ''
        sheet.getCell(`${coordinates.balloons_columns.balloon_creo_id}${row}`).value = 
          balloon?.creoId || ''
        
        // Note data
        sheet.getCell(`${coordinates.balloons_columns.note_value}${row}`).value = 
          note?.noteValue || note?.creoId || ''
        sheet.getCell(`${coordinates.balloons_columns.note_creo_id}${row}`).value = 
          note?.creoId || ''
        
        // Attributes data (by order)
        const getAttributeByOrder = (attrs, order) => {
          const attr = attrs?.find(a => a.order === order)
          return attr?.attributeValue || ''
        }
        
        sheet.getCell(`${coordinates.balloons_columns.attribute_1}${row}`).value = 
          getAttributeByOrder(attributes, 1)
        sheet.getCell(`${coordinates.balloons_columns.attribute_2}${row}`).value = 
          getAttributeByOrder(attributes, 2)
        sheet.getCell(`${coordinates.balloons_columns.attribute_3}${row}`).value = 
          getAttributeByOrder(attributes, 3)
        sheet.getCell(`${coordinates.balloons_columns.attribute_4}${row}`).value = 
          getAttributeByOrder(attributes, 4)
      })
      
      if (debug) {
        console.log(`[DEBUG] generateExcelDrawings - Balloons populated: ${balloons.length} balloons starting from row ${balloonsStartRow}`)
      }
    }

    // Genera il buffer di output
    const bufferOut = await workbook.xlsx.writeBuffer()
    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - Output file size:', bufferOut.length)
    }

    // Genera filename basato sui dati
    const safeDrawingName = (drawingName || drawingCode || 'drawing').replace(/[^a-zA-Z0-9_.]/g, '_')
    const safeSheetName = (sheetName || sheetCreoId || 'sheet').replace(/[^a-zA-Z0-9_.]/g, '_')
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `${safeDrawingName}_${safeSheetName}_${timestamp}.xlsx`

    // Imposta gli header di risposta
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(bufferOut.length)
    }
    
    if (debug) {
      headers['X-Debug-Input-Size'] = String(bufferIn.length)
      headers['X-Debug-Output-Size'] = String(bufferOut.length)
      headers['X-Debug-Models-Count'] = String(models.length)
      headers['X-Debug-Balloons-Count'] = String(balloons.length)
    }

    if (debug) {
      console.log('[DEBUG] generateExcelDrawings - File generated successfully:', filename)
    }

    // Restituisce il file Excel come buffer
    return new Response(bufferOut, {
      status: 200,
      headers
    })
    
  } catch (error: any) {
    const config = useRuntimeConfig()
    const debug = config.public.debug === 'true'
    
    if (debug) {
      console.error('[DEBUG] generateExcelDrawings - Error:', error.message)
      console.error('[DEBUG] generateExcelDrawings - Stack:', error.stack)
    }
    
    // Se è un errore H3, ritorna quello
    if (error.statusCode) {
      throw error
    }
    
    // Altrimenti crea un errore generico
    throw createError({
      statusCode: 500,
      statusMessage: `Error generating Excel for drawings: ${error.message}`
    })
  }
})

// Version: 1.0.0