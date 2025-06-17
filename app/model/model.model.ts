import { type IArchive } from './archive.model';
import { type IModelVersion } from './model-version.model';
import { type IItem } from './item.model';
import { type ISheet } from './sheet.model';

import { type ModelType } from './enumerations/model-type.model';
import { type InstanceType } from './enumerations/instance-type.model';
export interface IModel {
  id?: number;
  code?: string | null;
  name?: string | null;
  modelType?: keyof typeof ModelType | null;
  instanceType?: keyof typeof InstanceType | null;
  file?: IArchive | null;
  version?: IModelVersion | null;
  item?: IItem | null;
  generic?: IModel | null;
  parent?: IModel | null;
  sheets?: ISheet[] | null;
}

export class Model implements IModel {
  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public modelType?: keyof typeof ModelType | null,
    public instanceType?: keyof typeof InstanceType | null,
    public file?: IArchive | null,
    public version?: IModelVersion | null,
    public item?: IItem | null,
    public generic?: IModel | null,
    public parent?: IModel | null,
    public sheets?: ISheet[] | null,
  ) {}
}
