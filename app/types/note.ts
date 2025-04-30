// types/note.ts
export interface Note {
    id?: number;
    code?: string;
    name: string;
    noteName: string;
    noteValue: string;
    noteType: string;
    order?: number;
    baloonId?: number;
  }