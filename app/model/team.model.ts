export interface ITeam {
  id?: number;
  name?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  headQuarter?: ITeam | null;
}

export class Team implements ITeam {
  constructor(
    public id?: number,
    public name?: string | null,
    public description?: string | null,
    public address?: string | null,
    public city?: string | null,
    public country?: string | null,
    public headQuarter?: ITeam | null,
  ) {}
}
