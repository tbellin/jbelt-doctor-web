// types/format.ts - Integrated from backend models
import type { IArchive } from '~/model/archive.model'
import { DIN } from '~/model/enumerations/din.model'

export interface Format {
  id?: number
  creoId?: string | null
  code?: string | null
  name?: string | null
  formatType?: keyof typeof DIN | null
  dimX?: number | null
  dimY?: number | null
  file?: IArchive | null
}

// Re-export enum for backward compatibility
export { DIN as DINEnum } from '~/model/enumerations/din.model'