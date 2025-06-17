import { type IArchive } from './archive.model';
import { MarkerType } from './enumerations/marker-type.model';
import { Shape } from './enumerations/shape.model';

export interface IMarker {
  id?: number;
  code?: string;
  name?: string;
  markerType?: MarkerType;
  symbol?: string;
  color?: string;
  size?: number;
  shape?: Shape;
  description?: string;
  useInBalloons?: boolean;
  useInAnnotations?: boolean;
  file?: IArchive | null;
  // Legacy fields for backward compatibility
  symbolName?: string | null;
}

export class Marker implements IMarker {
  constructor(
    public id?: number,
    public code?: string,
    public name?: string,
    public markerType?: MarkerType,
    public symbol?: string,
    public color?: string,
    public size?: number,
    public shape?: Shape,
    public description?: string,
    public useInBalloons?: boolean,
    public useInAnnotations?: boolean,
    public symbolName?: string | null,
    public file?: IArchive | null,
  ) {
    this.useInBalloons = this.useInBalloons ?? true;
    this.useInAnnotations = this.useInAnnotations ?? true;
  }
}
