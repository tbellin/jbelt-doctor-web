import { type IPosition } from './position.model';
import { type IBaloon } from './baloon.model';

export interface INote {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  noteName?: string | null;
  noteValue?: string | null;
  noteType?: string | null;
  order?: number | null;
  position?: IPosition | null;
  baloon?: IBaloon | null;
}

export class Note implements INote {
  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public noteName?: string | null,
    public noteValue?: string | null,
    public noteType?: string | null,
    public order?: number | null,
    public position?: IPosition | null,
    public baloon?: IBaloon | null,
  ) {}
}
