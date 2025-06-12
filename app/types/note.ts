// types/note.ts - Integrated from backend models
import type { Position } from './position'
import type { Baloon } from './baloon'

export interface Note {
  id?: number
  creoId?: string | null
  code?: string | null
  name?: string | null
  noteName?: string | null
  noteValue?: string | null
  noteType?: string | null
  order?: number | null
  position?: Position | null
  baloon?: Baloon | null
}