import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserQuery } from '../models/use-query';
import { Conversation } from '../models/conversation';
import { SessionId } from '../models/session-id';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  endpoint = 'http://localhost:7000';
  constructor(private httpClient: HttpClient) {}

  healthCheck() {}

  sendMessage(dto: any): Observable<HttpResponse<Conversation>> {
    return this.httpClient.post<Conversation>(
      `${this.endpoint}/chat/conversations`,
      dto,
      {
        observe: 'response',
      }
    );
  }

  getModels(): Observable<HttpResponse<string[]>> {
    return this.httpClient.get<string[]>(`${this.endpoint}/chat/models`, {
      observe: 'response',
    });
  }

  getConversationsBySession(
    sessionKey: string
  ): Observable<HttpResponse<Conversation[]>> {
    return this.httpClient.get<Conversation[]>(
      `${this.endpoint}/chat/conversations`,
      {
        params: {
          'session-key': sessionKey,
        },
        observe: 'response',
      }
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
      }
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
    file: File
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
      }
    );
  }
}

export interface IHTTPResponse<T> {
  headers: { [header: string]: string | string[] } | string;
  body: T;
}
