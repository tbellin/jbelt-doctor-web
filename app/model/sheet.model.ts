import { type IModel } from './model.model';
import { type IFormat } from './format.model';

import { type DIN } from './enumerations/din.model';
export interface ISheet {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  formatType?: keyof typeof DIN | null;
  drawing?: IModel | null;
  format?: IFormat | null;
  models?: IModel[] | null;
}

export class Sheet implements ISheet {
  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public formatType?: keyof typeof DIN | null,
    public drawing?: IModel | null,
    public format?: IFormat | null,
    public models?: IModel[] | null,
  ) {}
}
