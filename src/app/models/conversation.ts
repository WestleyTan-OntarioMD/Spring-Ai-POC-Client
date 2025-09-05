export class Conversation {
  id?: string = '';
  user: boolean = false;
  createDt: Date = new Date();
  message: string = '';
  sessionKey: string = '';
}
