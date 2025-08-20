import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { Chat } from 'src/app/models/chat';
import { ChatRequest } from 'src/app/models/chat-request';
import { ApiService } from 'src/app/services/api.service';
import { v4 as uuidv4 } from 'uuid';

const APP_MODEL = 'APP_MODEL';
const CHAT = 'APP_CHATS';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  sessionId = localStorage.getItem('sessionId') || '';
  chatsMap: { [sessionId: string]: Chat[] } = JSON.parse(
    localStorage.getItem(CHAT) || JSON.stringify({})
  );
  models: string[] = [];
  buttonDisabled = false;

  form = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    modelIndex: new FormControl(
      parseInt(localStorage.getItem(APP_MODEL) || '0'),
      [Validators.required, Validators.min(0)]
    ),
    temperature: new FormControl(0.8, [
      Validators.required,
      Validators.min(0),
      Validators.max(2),
    ]),
    topP: new FormControl(0.1, [
      Validators.required,
      Validators.min(0),
      Validators.max(1),
    ]),
    presencePenalty: new FormControl(0, [
      Validators.required,
      Validators.min(-2),
      Validators.max(2),
    ]),
    frequencyPenalty: new FormControl(0, [
      Validators.required,
      Validators.min(-2),
      Validators.max(2),
    ]),
  });

  handleModelChange(event: any) {
    localStorage.setItem(APP_MODEL, event.value);
  }

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);

    this.route.queryParamMap
      .pipe(map((params: ParamMap) => params.get('sessionId')))
      .subscribe((id) => (this.sessionId = id || ''));

    this.apiService
      .getModels()
      .subscribe((res) => (this.models = res.body || []));
  }

  private addToChats(sessionId: string, isUser: boolean, content: string) {
    if (!content) return;
    let chats = this.chatsMap[sessionId];
    if (!chats) {
      chats = [];
      this.chatsMap[sessionId] = chats;
    }

    while (chats.length > 20) {
      chats.shift();
    }
    chats.push(new Chat(isUser, content));

    localStorage.setItem(CHAT, JSON.stringify(this.chatsMap));
  }

  generateSessionId() {
    const id = uuidv4();
    localStorage.setItem('sessionId', id);
    this.chatsMap = {};
    localStorage.setItem(CHAT, JSON.stringify({}));

    this.router.navigate([], {
      queryParams: {
        sessionId: id,
      },
    });
  }

  sendChat() {
    if (this.form.invalid) {
      console.error(this.form.errors);
      alert('Form errors!');
      return;
    }

    this.buttonDisabled = true;
    const formVal = this.form.value as ChatRequest;
    this.addToChats(this.sessionId, true, formVal.message);
    this.apiService
      .sendMessage(this.sessionId, formVal)
      .pipe(
        tap((res) => {
          this.addToChats(this.sessionId, false, res.body?.response as string);
          this.form.get('message')?.setValue('');
          this.scrollToBottom();
        }),
        catchError(() => {
          this.buttonDisabled = false;
          return EMPTY;
        })
      )
      .subscribe(() => (this.buttonDisabled = false));
  }

  scrollToBottom() {
    const el = document.getElementById('bottom-placeholder');
    el?.scrollIntoView();
  }
}
