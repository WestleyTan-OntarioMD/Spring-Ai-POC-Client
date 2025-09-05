export class Conversation {
  id?: string = '';
  isUser: boolean = false;
  createDt: Date = new Date();
  message: string = '';
  sessionId: string = '';
}
