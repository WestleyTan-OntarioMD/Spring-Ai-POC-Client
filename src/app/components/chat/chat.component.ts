import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  concatMap,
  delay,
  filter,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { Conversation } from 'src/app/models/conversation';
import { SessionId } from 'src/app/models/session-id';
import { UserQuery } from 'src/app/models/use-query';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy {
  destory$ = new Subject();
  selectedFile: File | null = null;

  sessionKey = localStorage.getItem('sessionKey') || '';
  sessions: SessionId[] = [];
  conversations: Conversation[] = [];
  buttonDisabled = false;

  form = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  @ViewChild('message') message: ElementRef = <ElementRef>{};
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.getSessions().subscribe();

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

    this.apiService.assistantMessage$
      .pipe(
        concatMap((text) => of(text).pipe(delay(200))),
        takeUntil(this.destory$),
      )
      .subscribe({
        next: (text) => {
          this.conversations[this.conversations.length - 1].message += text;
          this.scrollToBottom();
        },
        complete: () => {
          this.selectedFile = null;
          this.buttonDisabled = false;
        },
      });

    this.apiService.assistantMessageReturned$
      .pipe(takeUntil(this.destory$))
      .subscribe((content) =>
        this.apiService.saveAssistanceMessage(this.sessionKey, content),
      );
  }

  handleSessionDelete() {
    if (!confirm(`Are you sure you want to delete this conversation?`)) return;

    const session = this.sessions.find((s) => s.key === this.sessionKey);
    if (!session) return;

    this.apiService
      .deleteSessionById(session.id)
      .pipe(
        concatMap(() => this.getSessions()),
        map(() => this.sessions[this.sessions.length - 1]?.id),
        tap((nextKey) => {
          localStorage.setItem('sessionKey', nextKey);
          this.sessionKey = nextKey;
        }),
      )
      .subscribe((sessionKey) =>
        this.router.navigate([], { queryParams: { sessionKey } }),
      );
  }

  fetchConversations(key: string | null) {
    if (!key) return;

    this.apiService
      .getConversationsBySession(key)
      .subscribe((conversations) => (this.conversations = conversations));
  }

  getSessions(): Observable<any> {
    return this.apiService.getAllSessions().pipe(
      tap((sessions) => (this.sessions = sessions)),
      map(() => true),
    );
  }

  private addToChats(sessionKey: string, isUser: boolean, message: string) {
    while (this.conversations.length > 20) this.conversations.shift();

    this.conversations.push({
      id: '',
      sessionKey,
      user: isUser,
      createDt: new Date(),
      message,
    });
  }

  generateSessionKey() {
    this.apiService
      .generateSession()
      .pipe(
        tap((sessionId: SessionId) => {
          const sessionKey = sessionId.key;
          localStorage.setItem('sessionKey', sessionKey);
          this.sessionKey = sessionKey;
        }),
        concatMap(() => this.getSessions()),
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
    this.addToChats(this.sessionKey, true, formVal.content);
    this.addToChats(this.sessionKey, false, '');
    this.scrollToBottom();

    const formData = new FormData();
    formData.append(
      'userQuery',
      new Blob([JSON.stringify(formVal)], { type: 'application/json' }),
    );

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.form.reset();
    this.apiService.sendMessage(this.sessionKey, formData).subscribe({
      next: () => {
        fileInput.value = '';
        this.selectedFile = null;
      },
      error: (err) => console.error('ERROR:', err),
      complete: () => {
        this.message.nativeElement.focus();
        this.buttonDisabled = false;
      },
    });
  }

  scrollToBottom() {
    const el = document.getElementById('bottom-placeholder');
    el?.scrollIntoView();
  }

  ngOnDestroy(): void {
    this.destory$.next(true);
    this.destory$.complete();
  }
}
