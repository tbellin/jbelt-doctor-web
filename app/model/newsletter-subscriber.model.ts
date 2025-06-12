export interface INewsletterSubscriber {
  id?: number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isSubscribed?: boolean | null;
}

export class NewsletterSubscriber implements INewsletterSubscriber {
  constructor(
    public id?: number,
    public email?: string | null,
    public firstName?: string | null,
    public lastName?: string | null,
    public isSubscribed?: boolean | null,
  ) {
    this.isSubscribed = this.isSubscribed ?? false;
  }
}
