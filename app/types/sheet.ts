// types/sheet.ts
export interface Sheet {
    id?: number;
    code?: string;
    name: string;
    formatType: DINEnum;
    formatId?: number;
  }
  
  export enum DINEnum {
    A0 = 'A0',
    A1 = 'A1',
    A2 = 'A2',
    A3V = 'A3V',
    A3O = 'A3O',
    A4V = 'A4V',
    A4O = 'A4O'
  }