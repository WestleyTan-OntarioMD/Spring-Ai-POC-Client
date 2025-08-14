export class ChatRequest {
  message: string = '';
  modelIndex: number = 0;
  temperature: number = 0.8;
  topP: number = 0.1;
  presencePenalty: number = 0;
  frequencyPenalty: number = 0;
}
