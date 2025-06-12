// types/model.ts
export interface Model {
    id?: number;
    code?: string;
    name: string;
    modelType: ModelTypeEnum;
    instanceType?: InstanceTypeEnum;
    designerId?: number;
    itemId?: number;
    parentId?: number;
    instanceId?: number;
  }
  
  export enum ModelTypeEnum {
    PART = 'PART',
    ASSEMBLY = 'ASSEMBLY',
    DRAWING = 'DRAWING',
    FORMAT = 'FORMAT'
  }
  
  export enum InstanceTypeEnum {
    PARAMETRIC = 'PARAMETRIC',
    NORMAL = 'NORMAL',
    GENERIC = 'GENERIC',
    INSTANCE = 'INSTANCE',
    BULK = 'BULK'
  }