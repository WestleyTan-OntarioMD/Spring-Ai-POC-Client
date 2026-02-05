import { AgentTag } from './agent-tag';
import { Base } from './base';

export class Report extends Base {
  message: string = '';
  agent: AgentTag = new AgentTag();
}
