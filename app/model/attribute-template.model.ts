import { type TypeValue } from './enumerations/type-value.model';
export interface IAttributeTemplate {
  id?: number;
  code?: string | null;
  name?: string | null;
  typeValue?: keyof typeof TypeValue | null;
  category?: string | null;
  attributeValue?: string | null;
  order?: number | null;
}

export class AttributeTemplate implements IAttributeTemplate {
  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public typeValue?: keyof typeof TypeValue | null,
    public category?: string | null,
    public attributeValue?: string | null,
    public order?: number | null,
  ) {}
}
