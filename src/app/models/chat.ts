export class Chat {
  timestamp = new Date();
  isUser: boolean = false;
  content: string = '';
  constructor(isUser: boolean, content: string) {
    this.isUser = isUser;
    this.content = content;
  }
}
