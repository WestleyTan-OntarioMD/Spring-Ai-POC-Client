import { Base } from './base';

export class Conversation extends Base {
  user: boolean = false;
  message: string = '';
  sessionKey: string = '';
}
