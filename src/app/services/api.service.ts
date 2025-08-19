import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatRequest } from '../models/chat-request';
import { Observable } from 'rxjs';
import { ChatResponse } from '../models/chat-response';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  endpoint = 'http://localhost:7000';
  constructor(private httpClient: HttpClient) {}

  healthCheck() {}

  sendMessage(
    sessionId: string,
    dto: ChatRequest
  ): Observable<HttpResponse<ChatResponse>> {
    return this.httpClient.post<ChatResponse>(
      `${this.endpoint}/chat/conversations`,
      dto,
      {
        params: {
          'session-id': sessionId,
        },
        observe: 'response',
      }
    );
  }

  getModels(): Observable<HttpResponse<string[]>> {
    return this.httpClient.get<string[]>(`${this.endpoint}/chat/models`, {
      observe: 'response',
    });
  }

  // getMessages(sessionId: string, dto: ChatRequest) {
  //   return this.httpClient.post(`${this.endpoint}/chat/generate`, dto, {
  //     params: {
  //       'session-id': sessionId,
  //     },
  //     observe: 'response',
  //   });
  // }

  uploadFile(
    sessionId: string,
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
          'session-id': sessionId,
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
