import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';

import { Conversation } from '../models/conversation';
import { SessionId } from '../models/session-id';
import { environment } from 'src/environments/environment';
import { AgentTag } from '../models/agent-tag';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private endpoint;
  constructor(private httpClient: HttpClient) {
    this.endpoint = environment.endpoint;
  }

  listAgents(): Observable<AgentTag[]> {
    return this.httpClient
      .get<AgentTag[]>(`${this.endpoint}/hq/agent-tags`, {
        observe: 'response',
      })
      .pipe(map((res) => <AgentTag[]>res.body));
  }

  listReport(minutes: number, identification: string): Observable<Report[]> {
    return this.httpClient
      .get<Report[]>(`${this.endpoint}/hq/reports`, {
        params: {
          'x-minutes': minutes,
          'x-agent-identification': identification,
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
  sendMessage(dto: any): Observable<HttpResponse<Conversation>> {
    return this.httpClient.post<Conversation>(
      `${this.endpoint}/chat/conversations`,
      dto,
      {
        observe: 'response',
      },
    );
  }

  getModels(): Observable<HttpResponse<string[]>> {
    return this.httpClient.get<string[]>(`${this.endpoint}/chat/models`, {
      observe: 'response',
    });
  }

  getConversationsBySession(
    sessionKey: string,
  ): Observable<HttpResponse<Conversation[]>> {
    return this.httpClient.get<Conversation[]>(
      `${this.endpoint}/chat/conversations`,
      {
        params: {
          'session-key': sessionKey,
        },
        observe: 'response',
      },
    );
  }

  getAllSessions(): Observable<HttpResponse<SessionId[]>> {
    return this.httpClient.get<SessionId[]>(`${this.endpoint}/chat/sessions`, {
      observe: 'response',
    });
  }

  generateSession(): Observable<HttpResponse<SessionId>> {
    return this.httpClient.post<SessionId>(
      `${this.endpoint}/chat/sessions`,
      {},
      {
        observe: 'response',
      },
    );
  }

  deleteSessionById(id: string): Observable<HttpResponse<any>> {
    return this.httpClient.delete<any>(`${this.endpoint}/chat/sessions/${id}`, {
      observe: 'response',
    });
  }

  uploadFile(
    sessionKey: string,
    prompt: string,
    useLLM: string,
    file: File,
  ): Observable<HttpResponse<{ content: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<{ content: string }>(
      `${this.endpoint}/docs/analysis`,
      formData,
      {
        params: {
          'session-key': sessionKey,
          prompt: prompt,
          'use-llm': useLLM,
        },
        observe: 'response',
      },
    );
  }
}

export interface IHTTPResponse<T> {
  headers: { [header: string]: string | string[] } | string;
  body: T;
}
