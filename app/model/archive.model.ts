export interface IArchive {
  id?: number;
  code?: string | null;
  name?: string | null;
  type?: string | null;
  category?: string | null;
  fileName?: string | null;
  extension?: string | null;
  folder?: string | null;
  contentContentType?: string | null;
  content?: string | null;
}

export class Archive implements IArchive {
  constructor(
    public id?: number,
    public code?: string | null,
    public name?: string | null,
    public type?: string | null,
    public category?: string | null,
    public fileName?: string | null,
    public extension?: string | null,
    public folder?: string | null,
    public contentContentType?: string | null,
    public content?: string | null,
  ) {}
}
