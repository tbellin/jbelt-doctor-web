// types/position.ts - Integrated from backend models
import { TypeValue } from '~/model/enumerations/type-value.model'

export interface Position {
  id?: number
  code?: string | null
  name?: string | null
  typeValue?: keyof typeof TypeValue | null
  attributeValue?: string | null
  posX?: number | null
  posY?: number | null
  posZ?: number | null
  box?: string | null
}

// Re-export enum for backward compatibility
export { TypeValue as TypeValueEnum } from '~/model/enumerations/type-value.model'