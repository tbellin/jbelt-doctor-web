// types/author.ts
// Re-export from model for backward compatibility
export type { IAuthor as Author, Author as AuthorClass } from '~/model/author.model'

// Legacy interface for backward compatibility if needed
export interface AuthorLegacy {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}