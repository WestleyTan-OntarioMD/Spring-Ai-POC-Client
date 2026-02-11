import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

import { Conversation } from '../models/conversation';
import { SessionId } from '../models/session-id';
import { environment } from 'src/environments/environment';
import { AgentTag } from '../models/agent-tag';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly agents$ = new BehaviorSubject<AgentTag[]>([]);

  private endpoint;
  constructor(private httpClient: HttpClient) {
    this.endpoint = environment.endpoint;

    this.fetchAgents();
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
    identification: string,
  ): Observable<Report[]> {
    return this.httpClient
      .get<Report[]>(`${this.endpoint}/assistance/hq/reports`, {
        params: {
          'X-Minutes': minutes + '',
          'X-Agent-Identification': identification,
        },
        observe: 'response',
      })
      .pipe(map((res) => <Report[]>res.body));
  }

  requestToHQ(message: string): Observable<Conversation> {
    return this.httpClient
      .post<Conversation>(
        `${this.endpoint}/assistance/agents/requests`,
        { message },
        {
          observe: 'response',
        },
      )
      .pipe(map((res) => <Conversation>res.body));
  }
  sendMessage(dto: any): Observable<Conversation> {
    return this.httpClient
      .post<Conversation>(`${this.endpoint}/chat/conversations`, dto, {
        observe: 'response',
      })
      .pipe(map((res) => <Conversation>res.body));
  }

  getModels(): Observable<string[]> {
    return this.httpClient
      .get<string[]>(`${this.endpoint}/chat/models`, {
        observe: 'response',
      })
      .pipe(map((res) => <string[]>res.body));
  }

  getConversationsBySession(sessionKey: string): Observable<Conversation[]> {
    return this.httpClient
      .get<Conversation[]>(`${this.endpoint}/chat/conversations`, {
        params: {
          'session-key': sessionKey,
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
          'session-key': sessionKey,
          prompt: prompt,
          'use-llm': useLLM,
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
