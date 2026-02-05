import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { concatMap, delay, filter, map, Observable, of, tap } from 'rxjs';

import { Conversation } from 'src/app/models/conversation';
import { SessionId } from 'src/app/models/session-id';
import { UserQuery } from 'src/app/models/use-query';
import { ApiService } from 'src/app/services/api.service';

const APP_MODEL = 'APP_MODEL';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  selectedFile: File | null = null;

  sessionKey = localStorage.getItem('sessionKey') || '';
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
      [Validators.required, Validators.min(0)],
    ),
  });

  @ViewChild('message') message: ElementRef = <ElementRef>{};
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.getSessions().subscribe((sessions) => (this.sessions = sessions));

    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);

    this.route.queryParamMap
      .pipe(
        map((params: ParamMap) => params.get('sessionKey') || ''),
        tap((id) => (this.sessionKey = id)),
        filter((id) => !!id),
      )
      .subscribe((id) => this.fetchConversations(id));

    this.apiService
      .getModels()
      .subscribe((res) => (this.models = res.body || []));
  }

  handleSessionDelete() {
    if (!confirm(`Are you sure you want to delete this conversation?`)) return;

    const session = this.sessions.find((s) => s.key === this.sessionKey);
    if (!session) return;

    this.apiService
      .deleteSessionById(session.id)
      .subscribe(() => this.generateSessionKey());
  }

  fetchConversations(key: string | null) {
    if (!key) return;

    this.apiService
      .getConversationsBySession(key)
      .pipe(map((res) => res.body || []))
      .subscribe((conversations) => (this.conversations = conversations));
  }

  getSessions(): Observable<SessionId[]> {
    return this.apiService.getAllSessions().pipe(map((res) => res.body || []));
  }

  handleModelChange(event: any) {
    localStorage.setItem(APP_MODEL, event.value);
  }

  private addToChats(sessionKey: string, user: boolean, message: string) {
    while (this.conversations.length > 20) this.conversations.shift();

    this.conversations.push({
      id: '',
      user,
      createDt: new Date(),
      message,
      sessionKey,
    });
  }

  generateSessionKey() {
    this.apiService
      .generateSession()
      .pipe(
        map((res) => res.body!),
        tap((sessionId: SessionId) => {
          const sessionKey = sessionId.key;
          localStorage.setItem('sessionKey', sessionKey);
          this.sessionKey = sessionKey;
        }),
        concatMap(() => this.getSessions()),
        tap((sessions) => (this.sessions = sessions)),
      )
      .subscribe(() =>
        this.router.navigate([], {
          queryParams: {
            sessionKey: this.sessionKey,
          },
        }),
      );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  sendChat(fileInput: HTMLInputElement) {
    if (this.form.invalid) {
      console.error(this.form.errors);
      alert('Form errors!');
      return;
    }

    this.buttonDisabled = true;
    const formVal = this.form.value as UserQuery;
    this.addToChats(this.sessionKey, true, formVal.message);

    const formData = new FormData();
    formData.append('session-key', this.sessionKey);
    formData.append(
      'userQuery',
      new Blob([JSON.stringify(formVal)], { type: 'application/json' }),
    );
    if (this.selectedFile)
      formData.append('file', this.selectedFile, this.selectedFile.name);

    of(true)
      .pipe(
        delay(1),
        tap(() => this.scrollToBottom()),
        concatMap(() => this.apiService.sendMessage(formData)),
        filter((res) => !!res.body?.sessionKey),
        tap((res) => {
          this.addToChats(this.sessionKey, false, res.body!.message as string);
          this.sessionKey = res.body!.sessionKey as string;
          this.form.get('message')?.setValue('');
        }),
        delay(100),
      )
      .subscribe(() => {
        fileInput.value = '';
        this.selectedFile = null;
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
