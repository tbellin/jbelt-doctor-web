import { type IUser } from './user.model';
import { type ITeam } from './team.model';

export interface IAuthor {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  user?: IUser | null;
  team?: ITeam | null;
  // Extended fields for UI support
  isActive?: boolean;
  department?: string | null;
  role?: string | null;
  permissions?: string[];
  teams?: ITeam[];
  canReceiveNotifications?: boolean;
  avatar?: string | null;
  lastLoginDate?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
}

export class Author implements IAuthor {
  constructor(
    public id?: number,
    public firstName?: string | null,
    public lastName?: string | null,
    public email?: string | null,
    public phoneNumber?: string | null,
    public user?: IUser | null,
    public team?: ITeam | null,
    // Extended fields
    public isActive?: boolean,
    public department?: string | null,
    public role?: string | null,
    public permissions?: string[],
    public teams?: ITeam[],
    public canReceiveNotifications?: boolean,
    public avatar?: string | null,
    public lastLoginDate?: string | null,
    public createdDate?: string | null,
    public modifiedDate?: string | null,
  ) {
    this.isActive = this.isActive ?? true;
    this.canReceiveNotifications = this.canReceiveNotifications ?? true;
    this.permissions = this.permissions ?? [];
    this.teams = this.teams ?? [];
  }
}
