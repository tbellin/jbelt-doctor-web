import { ItemType } from './enumerations/item-type.model';

export interface IItem {
  id?: number;
  code?: string;
  name?: string;
  itemType?: ItemType;
  category?: string;
  description?: string;
  textValue?: string;
  numberValue?: number;
  unit?: string;
  booleanValue?: boolean;
  dateValue?: string;
  parent?: IItem;
  children?: IItem[];
  tags?: string[];
  // Legacy fields for backward compatibility
  itemCode?: string | null;
  itemName?: string | null;
  itemActive?: boolean | null;
  active?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  expirationDate?: Date | null;
}

export class Item implements IItem {
  constructor(
    public id?: number,
    public code?: string,
    public name?: string,
    public itemType?: ItemType,
    public category?: string,
    public description?: string,
    public textValue?: string,
    public numberValue?: number,
    public unit?: string,
    public booleanValue?: boolean,
    public dateValue?: string,
    public parent?: IItem,
    public tags?: string[],
    // Legacy fields for backward compatibility
    public itemCode?: string | null,
    public itemName?: string | null,
    public itemActive?: boolean | null,
    public active?: boolean | null,
    public createdAt?: Date | null,
    public updatedAt?: Date | null,
    public expirationDate?: Date | null,
  ) {
    this.itemActive = this.itemActive ?? false;
    this.active = this.active ?? false;
  }
}
