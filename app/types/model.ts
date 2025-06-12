// types/model.ts - Integrated from backend models
import type { IArchive } from '~/model/archive.model'
import type { IModelVersion } from '~/model/model-version.model'
import type { IItem } from '~/model/item.model'
import type { ISheet } from '~/model/sheet.model'
import { ModelType } from '~/model/enumerations/model-type.model'
import { InstanceType } from '~/model/enumerations/instance-type.model'

export interface Model {
  id?: number
  code?: string | null
  name?: string | null
  modelType?: keyof typeof ModelType | null
  instanceType?: keyof typeof InstanceType | null
  file?: IArchive | null
  version?: IModelVersion | null
  item?: IItem | null
  generic?: Model | null
  parent?: Model | null
  sheets?: ISheet[] | null
}

// Re-export enums for backward compatibility
export { ModelType as ModelTypeEnum } from '~/model/enumerations/model-type.model'
export { InstanceType as InstanceTypeEnum } from '~/model/enumerations/instance-type.model'