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
  ) {}
}
