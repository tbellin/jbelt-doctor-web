import { type IArchive } from '@/shared/model/archive.model';

export interface IMarker {
  id?: number;
  code?: string | null;
  name?: string | null;
  symbolName?: string | null;
  file?: IArchive | null;
}

export class Marker implements IMarker {
  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public symbolName?: string | null,
    public file?: IArchive | null,
  ) {}
}
