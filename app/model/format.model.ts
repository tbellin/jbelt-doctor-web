import { type IArchive } from '@/shared/model/archive.model';

import { type DIN } from '@/shared/model/enumerations/din.model';
export interface IFormat {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  formatType?: keyof typeof DIN | null;
  dimX?: number | null;
  dimY?: number | null;
  file?: IArchive | null;
}

export class Format implements IFormat {
  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public formatType?: keyof typeof DIN | null,
    public dimX?: number | null,
    public dimY?: number | null,
    public file?: IArchive | null,
  ) {}
}
