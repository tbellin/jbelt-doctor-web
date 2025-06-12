import { type IAuthor } from './author.model';

export interface IModelVersion {
  id?: number;
  versionNumber?: string | null;
  createdAt?: Date | null;
  modifiedAt?: Date | null;
  active?: boolean | null;
  changeLog?: string | null;
  designer?: IAuthor | null;
}

export class ModelVersion implements IModelVersion {
  constructor(
    public id?: number,
    public versionNumber?: string | null,
    public createdAt?: Date | null,
    public modifiedAt?: Date | null,
    public active?: boolean | null,
    public changeLog?: string | null,
    public designer?: IAuthor | null,
  ) {
    this.active = this.active ?? false;
  }
}
