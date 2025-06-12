// Formati disponibili per i fogli
export const SHEET_FORMATS = [
  'A0',
  'A1', 
  'A2',
  'A3V',
  'A3O', 
  'A4V',
  'A4O'
] as const

export type SheetFormat = typeof SHEET_FORMATS[number]

/**
 * Combina i formati predefiniti con quelli trovati nei dati esistenti
 * @param existingFormats Array di formati trovati nei dati
 * @returns Array ordinato di tutti i formati disponibili
 */
export function getAvailableFormats(existingFormats: (string | null | undefined)[] = []): string[] {
  // Filtra e pulisce i formati esistenti
  const validExistingFormats = existingFormats
    .filter((format): format is string => format != null && format.trim() !== '')
  
  // Combina predefiniti + esistenti, rimuove duplicati e ordina
  const allFormats = new Set([...SHEET_FORMATS, ...validExistingFormats])
  return Array.from(allFormats).sort()
}