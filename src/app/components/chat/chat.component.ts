import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { concatMap, delay, filter, map, of, tap } from 'rxjs';

import { Conversation } from 'src/app/models/conversation';
import { SessionId } from 'src/app/models/session-id';
import { UserQuery } from 'src/app/models/use-query';
import { ApiService } from 'src/app/services/api.service';
import { v4 as uuidv4 } from 'uuid';

const APP_MODEL = 'APP_MODEL';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  sessionId = localStorage.getItem('sessionId') || uuidv4();
  sessions: SessionId[] = [];
  conversations: Conversation[] = [];
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

  @ViewChild('message') message: ElementRef = <ElementRef>{};
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.fetchSessions();

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

  handleSessionDelete(id: string) {
    this.apiService.deleteSessionById(id).subscribe(() => this.fetchSessions());
  }

  fetchConversations(event: any) {
    if (!event.value) {
      this.conversations = [];
      return;
    }

    this.apiService
      .getConversationsBySession(event.value)
      .pipe(map((res) => res.body || []))
      .subscribe((conversations) => (this.conversations = conversations));
  }

  fetchSessions() {
    this.apiService
      .getAllSessions()
      .pipe(map((res) => res.body || []))
      .subscribe((sessionIds) => (this.sessions = sessionIds));
  }

  handleModelChange(event: any) {
    localStorage.setItem(APP_MODEL, event.value);
  }

  private addToChats(sessionId: string, isUser: boolean, message: string) {
    while (this.conversations.length > 20) this.conversations.shift();

    this.conversations.push({
      isUser,
      createDt: new Date(),
      message,
      sessionId,
    });
  }

  generateSessionId() {
    const id = uuidv4();
    localStorage.setItem('sessionId', id);
    this.conversations = [];

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
    const formVal = this.form.value as UserQuery;
    this.addToChats(this.sessionId, true, formVal.message);

    of(true)
      .pipe(
        delay(1),
        tap(() => this.scrollToBottom()),
        concatMap(() => this.apiService.sendMessage(this.sessionId, formVal)),
        filter((res) => !!res.body?.sessionId),
        tap((res) => {
          this.addToChats(this.sessionId, false, res.body!.message as string);
          this.sessionId = res.body!.sessionId as string;
          this.form.get('message')?.setValue('');
        }),
        delay(100)
      )
      .subscribe(() => {
        this.buttonDisabled = false;
        this.scrollToBottom();
        this.message.nativeElement.focus();
      });
  }

  scrollToBottom() {
    const el = document.getElementById('bottom-placeholder');
    el?.scrollIntoView();
  }
}
