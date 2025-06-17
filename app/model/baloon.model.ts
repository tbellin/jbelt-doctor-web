import { type IPosition } from './position.model';
import { type ISheet } from './sheet.model';
import { type IMarker } from './marker.model';

export interface IBaloon {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  baloonName?: string | null;
  baloonValue?: string | null;
  baloonType?: string | null;
  box?: string | null;
  position?: IPosition | null;
  sheet?: ISheet | null;
  symbol?: IMarker | null;
}

export class Baloon implements IBaloon {
  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public baloonName?: string | null,
    public baloonValue?: string | null,
    public baloonType?: string | null,
    public box?: string | null,
    public position?: IPosition | null,
    public sheet?: ISheet | null,
    public symbol?: IMarker | null,
  ) {}
}
