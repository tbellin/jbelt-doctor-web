import { type TypeValue } from '@/shared/model/enumerations/type-value.model';
export interface IPosition {
  id?: number;
  code?: string | null;
  name?: string | null;
  typeValue?: keyof typeof TypeValue | null;
  attributeValue?: string | null;
  posX?: number | null;
  posY?: number | null;
  posZ?: number | null;
  box?: string | null;
}

export class Position implements IPosition {
  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public typeValue?: keyof typeof TypeValue | null,
    public attributeValue?: string | null,
    public posX?: number | null,
    public posY?: number | null,
    public posZ?: number | null,
    public box?: string | null,
  ) {}
}
