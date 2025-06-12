export interface IPostType {
  id?: number;
  name?: string;
}

export class PostType implements IPostType {
  constructor(
    public id?: number,
    public name?: string,
  ) {}
}
