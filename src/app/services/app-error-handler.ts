import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error: HttpErrorResponse): void {
    if (error.status < 400) return;

    if (confirm(`Error: ${error.message}. Reload?`)) location.reload();
  }
}
