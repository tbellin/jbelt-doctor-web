import { type IAuthor } from './author.model';

export interface ITracker {
  id?: number;
  name?: string | null;
  description?: string | null;
  modelId?: string | null;
  processId?: string | null;
  processName?: string | null;
  status?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  author?: IAuthor | null;
}

export class Tracker implements ITracker {
  constructor(
    public id?: number,
    public name?: string | null,
    public description?: string | null,
    public modelId?: string | null,
    public processId?: string | null,
    public processName?: string | null,
    public status?: string | null,
    public createdAt?: Date | null,
    public updatedAt?: Date | null,
    public author?: IAuthor | null,
  ) {}
}
