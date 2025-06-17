import { type IAuthor } from './author.model';
import { type IModel } from './model.model';
import { VersionStatus } from './enumerations/version-status.model';

export interface IModelVersion {
  id?: number;
  versionNumber?: string;
  name?: string;
  status?: VersionStatus;
  createdDate?: string;
  comments?: string;
  isCurrentVersion?: boolean;
  isApproved?: boolean;
  model?: IModel;
  // Legacy fields for backward compatibility
  createdAt?: Date | null;
  modifiedAt?: Date | null;
  active?: boolean | null;
  changeLog?: string | null;
  designer?: IAuthor | null;
}

export class ModelVersion implements IModelVersion {
  constructor(
    public id?: number,
    public versionNumber?: string,
    public name?: string,
    public status?: VersionStatus,
    public createdDate?: string,
    public comments?: string,
    public isCurrentVersion?: boolean,
    public isApproved?: boolean,
    public model?: IModel,
    // Legacy fields for backward compatibility
    public createdAt?: Date | null,
    public modifiedAt?: Date | null,
    public active?: boolean | null,
    public changeLog?: string | null,
    public designer?: IAuthor | null,
  ) {
    this.active = this.active ?? false;
    this.isCurrentVersion = this.isCurrentVersion ?? false;
    this.isApproved = this.isApproved ?? false;
  }
}
