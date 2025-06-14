// app/server/api/generateExcel.post.ts
import { promises as fs } from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const debug = config.public.debug === 'true'
    const templatePath = config.public.templatePath
    
    // Rimuovi il leading slash se presente
    const relativePath = templatePath.startsWith('/') ? templatePath.slice(1) : templatePath
    const fullPath = path.resolve(process.cwd(), 'public', relativePath)
    
    if (debug) {
      console.log('[DEBUG] generateExcel - Template path:', templatePath)
      console.log('[DEBUG] generateExcel - Full path:', fullPath)
    }

    // Verifica se il file esiste
    try {
      await fs.access(fullPath)
    } catch (accessError) {
      if (debug) {
        console.log('[DEBUG] generateExcel - File not found:', fullPath)
      }
      throw createError({
        statusCode: 404,
        statusMessage: `Template file not found: ${relativePath}`
      })
    }

    // Legge il body della richiesta (opzionale per dati personalizzati)
    let requestData = {}
    try {
      requestData = await readBody(event) || {}
    } catch (bodyError) {
      // Ignora errori di parsing body se non c'è contenuto
      if (debug) {
        console.log('[DEBUG] generateExcel - No body data or parsing error')
      }
    }

    // Legge il file template
    const bufferIn = await fs.readFile(fullPath)
    if (debug) {
      console.log('[DEBUG] generateExcel - Input file size:', bufferIn.length)
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

    // Scrive i valori di test nelle celle specificate
    sheet.getCell('J2').value = 'Demo in J2'
    sheet.getCell('F3').value = 'Demo in F3'  // Corretto da B7 a F3 come richiesto
    
    // Opzionalmente, usa dati dal body della richiesta
    if (requestData && typeof requestData === 'object') {
      const data = requestData as any
      if (data.j2) sheet.getCell('J2').value = data.j2
      if (data.f3) sheet.getCell('F3').value = data.f3
    }

    if (debug) {
      console.log('[DEBUG] generateExcel - Cells updated: J2, F3')
    }

    // Genera il buffer di output
    const bufferOut = await workbook.xlsx.writeBuffer()
    if (debug) {
      console.log('[DEBUG] generateExcel - Output file size:', bufferOut.length)
    }

    // Imposta gli header di risposta
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="export.xlsx"',
      'Content-Length': String(bufferOut.length)
    }
    
    if (debug) {
      headers['X-Debug-Input-Size'] = String(bufferIn.length)
      headers['X-Debug-Output-Size'] = String(bufferOut.length)
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
      console.error('[DEBUG] generateExcel - Error:', error.message)
      console.error('[DEBUG] generateExcel - Stack:', error.stack)
    }
    
    // Se è un errore H3, ritorna quello
    if (error.statusCode) {
      throw error
    }
    
    // Altrimenti crea un errore generico
    throw createError({
      statusCode: 500,
      statusMessage: `Error generating Excel: ${error.message}`
    })
  }
})

// Version: 1.2.0