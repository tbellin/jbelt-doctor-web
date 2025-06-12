// types/baloon.ts - Integrated from backend models
import type { Position } from './position'
import type { Sheet } from './sheet'
import type { IMarker } from '~/model/marker.model'

export interface Baloon {
  id?: number
  creoId?: string | null
  code?: string | null
  name?: string | null
  baloonName?: string | null
  baloonValue?: string | null
  baloonType?: string | null
  position?: Position | null
  sheet?: Sheet | null
  symbol?: IMarker | null
}