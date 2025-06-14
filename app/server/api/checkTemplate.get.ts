// app/server/api/checkTemplate.get.ts
import { promises as fs } from 'fs'
import path from 'path'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const templatePath = config.public.templatePath
    const debug = config.public.debug === 'true'
    
    // Rimuovi il leading slash se presente
    const relativePath = templatePath.startsWith('/') ? templatePath.slice(1) : templatePath
    const fullPath = path.resolve(process.cwd(), 'public', relativePath)
    
    if (debug) {
      console.log('[DEBUG] checkTemplate - Template path:', templatePath)
      console.log('[DEBUG] checkTemplate - Relative path:', relativePath)
      console.log('[DEBUG] checkTemplate - Full path:', fullPath)
    }

    // Verifica se il file esiste
    try {
      await fs.access(fullPath)
    } catch (accessError) {
      if (debug) {
        console.log('[DEBUG] checkTemplate - File not found:', fullPath)
      }
      throw createError({
        statusCode: 404,
        statusMessage: `Template file not found: ${relativePath}`
      })
    }

    // Legge il file template
    const buffer = await fs.readFile(fullPath)
    
    if (debug) {
      console.log('[DEBUG] checkTemplate - File size:', buffer.length)
    }

    return {
      success: true,
      path: relativePath,
      size: buffer.length,
      exists: true
    }
    
  } catch (error: any) {
    const config = useRuntimeConfig()
    const debug = config.public.debug === 'true'
    
    if (debug) {
      console.error('[DEBUG] checkTemplate - Error:', error.message)
    }
    
    // Se è un errore H3, ritorna quello
    if (error.statusCode) {
      throw error
    }
    
    // Altrimenti crea un errore generico
    throw createError({
      statusCode: 500,
      statusMessage: `Error checking template: ${error.message}`
    })
  }
})

// Version: 1.2.0