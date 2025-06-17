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
  
  // Data completeness indicators
  isComplete?: boolean;
  missingFields?: string[];
  isPartialFromAssociation?: boolean;
}

export class Author implements IAuthor {
  public isComplete?: boolean;
  public missingFields?: string[];
  public isPartialFromAssociation?: boolean;

  constructor(
    public id?: number,
    public firstName?: string | null,
    public lastName?: string | null,
    public email?: string | null,
    public phoneNumber?: string | null,
    public user?: IUser | null,
    public team?: ITeam | null,
  ) {
    this.validateCompleteness();
  }

  /**
   * Validates if the author object has all essential fields for a complete author
   * Returns true if author is complete, false if it's partial (from association)
   */
  public validateCompleteness(): boolean {
    const requiredFields = ['id', 'firstName', 'lastName'];
    const missingFields: string[] = [];
    
    // Check for required fields
    for (const field of requiredFields) {
      const value = (this as any)[field];
      if (value === null || value === undefined || value === '') {
        missingFields.push(field);
      }
    }
    
    this.missingFields = missingFields;
    this.isComplete = missingFields.length === 0;
    
    // If we have an ID but missing other fields, likely from association
    this.isPartialFromAssociation = !!(this.id && missingFields.length > 0);
    
    return this.isComplete;
  }

  /**
   * Checks if this author is suitable for API update operations
   * @returns true if author can be safely sent to backend
   */
  public isValidForUpdate(): boolean {
    // Must have ID for updates
    if (!this.id || typeof this.id !== 'number') {
      return false;
    }
    
    // For updates, we accept partial objects if they have ID
    return true;
  }

  /**
   * Checks if this author is suitable for API create operations
   * @returns true if author can be safely sent to backend for creation
   */
  public isValidForCreate(): boolean {
    // For creation, we need at least firstName and lastName
    const requiredForCreate = ['firstName', 'lastName'];
    
    for (const field of requiredForCreate) {
      const value = (this as any)[field];
      if (!value || value === null || value === '') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Returns a clean object suitable for API operations
   */
  public toCleanObject(): any {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      user: this.user,
      team: this.team
    };
  }

  /**
   * Creates a debug-friendly representation of the author
   */
  public getDebugInfo(): string {
    return `Author[${this.id}]: ${this.firstName} ${this.lastName} (${this.email}) ` +
           `[Complete: ${this.isComplete}, Partial: ${this.isPartialFromAssociation}` +
           `${this.missingFields?.length ? `, Missing: ${this.missingFields.join(', ')}` : ''}]`;
  }

  /**
   * Returns the full name of the author
   */
  public getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    } else if (this.firstName) {
      return this.firstName;
    } else if (this.lastName) {
      return this.lastName;
    }
    return '';
  }

  /**
   * Static method to create an Author instance and validate it
   */
  static createAndValidate(data: Partial<IAuthor>): Author {
    const author = new Author(
      data.id,
      data.firstName,
      data.lastName,
      data.email,
      data.phoneNumber,
      data.user,
      data.team
    );
    
    console.log(`[Author] Created: ${author.getDebugInfo()}`);
    return author;
  }
}
