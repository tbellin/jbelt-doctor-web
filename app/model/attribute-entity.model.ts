import { type INote } from './note.model';
import { type IModel } from './model.model';
import { type IPost } from './post.model';

import { type TypeValue } from './enumerations/type-value.model';
export interface IAttributeEntity {
  id?: number;
  creoId?: string | null;
  code?: string | null;
  name?: string | null;
  typeValue?: keyof typeof TypeValue | null;
  attributeValue?: string | null;
  category?: string | null;
  order?: number | null;
  kind?: string | null;
  note?: INote | null;
  model?: IModel | null;
  post?: IPost | null;
}

export class AttributeEntity implements IAttributeEntity {
  constructor(
    public id?: number,
    public creoId?: string | null,
    public code?: string | null,
    public name?: string | null,
    public typeValue?: keyof typeof TypeValue | null,
    public attributeValue?: string | null,
    public category?: string | null,
    public order?: number | null,
    public kind?: string | null,
    public note?: INote | null,
    public model?: IModel | null,
    public post?: IPost | null,
  ) {}
}
