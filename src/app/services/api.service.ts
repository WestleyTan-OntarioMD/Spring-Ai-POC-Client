import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BehaviorSubject,
  concatMap,
  delay,
  from,
  map,
  Observable,
  of,
  Subject,
  take,
} from 'rxjs';
import { environment } from 'src/environments/environment';

import { AgentTag } from '../models/agent-tag';
import { Conversation } from '../models/conversation';
import { Report } from '../models/report';
import { SessionId } from '../models/session-id';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly agents$ = new BehaviorSubject<AgentTag[]>([]);
  readonly assistantMessage$ = new Subject<string>();
  readonly assistantMessageReturned$ = new Subject<string>();

  private endpoint;
  constructor(
    private httpClient: HttpClient,
    private ngxSpinnerService: NgxSpinnerService,
  ) {
    this.endpoint = environment.endpoint;
  }

  healthCheck(hideDelay: number = 0): void {
    const timer = setTimeout(() => {
      this.ngxSpinnerService.show();
    }, hideDelay);

    const hide = () => {
      clearTimeout(timer);
      this.ngxSpinnerService.hide();
    };
    this.httpClient
      .get<any>(`${this.endpoint}/insecure/health-check`)
      .pipe(delay(500))
      .subscribe({
        next: () => hide(),
        error: () => hide(),
        complete: () => hide(),
      });
  }

  fetchAgents(): void {
    this.httpClient
      .get<AgentTag[]>(`${this.endpoint}/assistance/hq/agent-tags`, {
        observe: 'response',
      })
      .subscribe((res) => this.agents$.next(<AgentTag[]>res.body));
  }

  listReportsByAgent(
    minutes: number,
    identification: string | undefined,
  ): Observable<Report[]> {
    return this.httpClient
      .get<Report[]>(`${this.endpoint}/assistance/hq/reports`, {
        params: {
          'X-Minutes': minutes + '',
          'X-Agent-Identification': identification || '',
        },
        observe: 'response',
      })
      .pipe(map((res) => <Report[]>res.body));
  }

  requestToHQ(message: string): Observable<string> {
    return this.httpClient
      .post<string>(
        `${this.endpoint}/assistance/agents/requests`,
        { message },
        {
          observe: 'response',
        },
      )
      .pipe(map((res) => <string>res.body));
  }
  sendMessage(sessionKey: string | null, dto: any): Observable<string> {
    let lastLength = 0;
    let currentText = '';
    return new Observable<string>((subscriber) =>
      this.httpClient
        .post(`${this.endpoint}/chat/conversations/with-streaming`, dto, {
          responseType: 'text',
          observe: 'events',
          reportProgress: true,
          params: {
            'x-session-key': sessionKey || '',
          },
        })
        .subscribe({
          next: (event: HttpEvent<string>) => {
            if (event.type === HttpEventType.DownloadProgress) {
              if ('partialText' in event && event.partialText) {
                currentText = <string>event.partialText;
                const newText = currentText
                  .substring(lastLength)
                  .replace(/^data:/, '')
                  .replace(/\n\ndata:/gi, '')
                  .trimEnd();
                lastLength = currentText.length;
                this.assistantMessage$.next(newText);
              }
            } else if (event.type === HttpEventType.Response) {
              const final = currentText
                .replace(/^data:/, '')
                .replace(/\n\ndata:/gi, '')
                .trimEnd();

              subscriber.complete();
              this.assistantMessageReturned$.next(final);
            }
          },
          error: (err) => subscriber.error(err),
        }),
    );
  }

  saveAssistanceMessage(sessionKey: string, content: string): void {
    this.httpClient
      .post(
        `${this.endpoint}/chat/conversations`,
        { content },
        {
          params: {
            'x-session-key': sessionKey,
          },
          observe: 'response',
        },
      )
      .subscribe();
  }
  getConversationsBySession(sessionKey: string): Observable<Conversation[]> {
    return this.httpClient
      .get<Conversation[]>(`${this.endpoint}/chat/conversations`, {
        params: {
          'x-session-key': sessionKey,
        },
        observe: 'response',
      })
      .pipe(map((res) => <Conversation[]>res.body));
  }

  getAllSessions(): Observable<SessionId[]> {
    return this.httpClient
      .get<SessionId[]>(`${this.endpoint}/chat/sessions`, {
        observe: 'response',
      })
      .pipe(map((res) => <SessionId[]>res.body));
  }

  generateSession(): Observable<SessionId> {
    return this.httpClient
      .post<SessionId>(
        `${this.endpoint}/chat/sessions`,
        {},
        {
          observe: 'response',
        },
      )
      .pipe(map((res) => <SessionId>res.body));
  }

  deleteSessionById(id: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.endpoint}/chat/sessions/${id}`, {
        observe: 'response',
      })
      .pipe(map((res) => res.body));
  }

  uploadFile(
    sessionKey: string,
    prompt: string,
    useLLM: string,
    file: File,
  ): Observable<{ content: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient
      .post<{ content: string }>(`${this.endpoint}/docs/analysis`, formData, {
        params: {
          'x-session-key': sessionKey,
          'use-llm': useLLM,
          prompt,
        },
        observe: 'response',
      })
      .pipe(map((res) => <{ content: string }>res.body));
  }
}

export interface IHTTPResponse<T> {
  headers: { [header: string]: string | string[] } | string;
  body: T;
}
