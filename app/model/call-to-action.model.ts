export interface ICallToAction {
  id?: number;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  buttonLabel?: string | null;
  targetUrl?: string | null;
  senderEmail?: string | null;
  submittedAt?: Date | null;
}

export class CallToAction implements ICallToAction {
  constructor(
    public id?: number,
    public title?: string | null,
    public description?: string | null,
    public content?: string | null,
    public buttonLabel?: string | null,
    public targetUrl?: string | null,
    public senderEmail?: string | null,
    public submittedAt?: Date | null,
  ) {}
}
