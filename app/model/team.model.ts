export interface ITeam {
  id?: number;
  name?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  headQuarter?: ITeam | null;
  // Extended fields for UI support
  isActive?: boolean;
  department?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  members?: any[]; // IAuthor[] - avoid circular dependency
  leader?: any | null; // IAuthor - avoid circular dependency
  capabilities?: string[];
  maxMembers?: number;
  createdDate?: string | null;
  modifiedDate?: string | null;
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
    // Extended fields
    public isActive?: boolean,
    public department?: string | null,
    public contactEmail?: string | null,
    public contactPhone?: string | null,
    public members?: any[], // IAuthor[]
    public leader?: any | null, // IAuthor
    public capabilities?: string[],
    public maxMembers?: number,
    public createdDate?: string | null,
    public modifiedDate?: string | null,
  ) {
    this.isActive = this.isActive ?? true;
    this.members = this.members ?? [];
    this.capabilities = this.capabilities ?? [];
    this.maxMembers = this.maxMembers ?? 10;
  }
}
