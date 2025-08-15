import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { delay, map, of, tap } from 'rxjs';
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
  chats: [Chat, Chat][] = JSON.parse(
    localStorage.getItem(CHAT) || JSON.stringify([])
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

  @ViewChild('chatContainer') chatContainer: ElementRef = <ElementRef>{};
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

  private addToChats(userContent: string, adminContent: string) {
    if (!userContent) return;
    if (this.chats.length >= 10) this.chats.length = 10;
    this.chats.push([
      new Chat(true, userContent),
      new Chat(false, adminContent),
    ]);

    localStorage.setItem(CHAT, JSON.stringify(this.chats));
  }

  generateSessionId() {
    const id = uuidv4();
    localStorage.setItem('sessionId', id);
    this.router.navigate([], {
      queryParams: {
        sessionId: id,
      },
    });
  }

  sendChat() {
    if (this.form.invalid) return;

    this.buttonDisabled = true;
    const formVal = this.form.value;
    this.apiService
      .sendMessage(this.sessionId, formVal as ChatRequest)
      .pipe(
        tap((res) => {
          this.addToChats(
            res.body?.message as string,
            res.body?.response as string
          );
          this.form.get('message')?.setValue('');
          this.scrollToBottom();
        }),
        delay(1000)
      )
      .subscribe(() => (this.buttonDisabled = false));
  }

  scrollToBottom() {
    const el = this.chatContainer.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }
}
