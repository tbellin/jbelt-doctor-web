export interface IItem {
  id?: number;
  itemCode?: string | null;
  itemName?: string | null;
  itemActive?: boolean | null;
  code?: string | null;
  active?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  expirationDate?: Date | null;
}

export class Item implements IItem {
  constructor(
    public id?: number,
    public itemCode?: string | null,
    public itemName?: string | null,
    public itemActive?: boolean | null,
    public code?: string | null,
    public active?: boolean | null,
    public createdAt?: Date | null,
    public updatedAt?: Date | null,
    public expirationDate?: Date | null,
  ) {
    this.itemActive = this.itemActive ?? false;
    this.active = this.active ?? false;
  }
}
