export interface IPostCategory {
  id?: number;
  name?: string;
}

export class PostCategory implements IPostCategory {
  constructor(
    public id?: number,
    public name?: string,
  ) {}
}
