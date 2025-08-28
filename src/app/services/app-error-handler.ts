import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error: HttpErrorResponse): void {
    if (confirm(`Error: ${error.message}. Reload?`)) location.reload();
  }
}
