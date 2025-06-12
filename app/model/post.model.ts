import { type IPostType } from './post-type.model';
import { type IPostCategory } from './post-category.model';
import { type IAuthor } from './author.model';

export interface IPost {
  id?: number;
  title?: string | null;
  subTitle?: string | null;
  content?: string | null;
  publishedAt?: Date | null;
  expiresAt?: Date | null;
  type?: IPostType | null;
  category?: IPostCategory | null;
  author?: IAuthor | null;
}

export class Post implements IPost {
  constructor(
    public id?: number,
    public title?: string | null,
    public subTitle?: string | null,
    public content?: string | null,
    public publishedAt?: Date | null,
    public expiresAt?: Date | null,
    public type?: IPostType | null,
    public category?: IPostCategory | null,
    public author?: IAuthor | null,
  ) {}
}
