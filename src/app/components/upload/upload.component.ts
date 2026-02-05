import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

const TEXT = 'APP_FILE_TEXT';
const MODE = 'APP_FILE_MODE';
const PROMPT = 'APP_FILE_PROMPT';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  sessionId = localStorage.getItem('sessionId') || '';

  prompt = localStorage.getItem(PROMPT) || '';
  text = localStorage.getItem(TEXT) || '';
  useMode = localStorage.getItem(MODE) || '1';
  modes = [
    {
      key: '1',
      value: 'Use LLM',
    },
    {
      key: '',
      value: 'Use OCR',
    },
  ];

  selectedFile: File | null = null;
  submitted = false;

  copied = false;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  copy() {
    if (!this.text) return;
    navigator.clipboard.writeText(this.text);
    alert('Text Copied!');
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
  onUpload(fileInput: HTMLInputElement) {
    if (!this.selectedFile || this.submitted) return;
    this.submitted = true;
    this.saveText('');
    this.apiService
      .uploadFile(this.sessionId, this.prompt, this.useMode, this.selectedFile)
      .subscribe((res) => {
        this.saveText(res?.content || '');

        fileInput.value = '';
        this.selectedFile = null;
        this.submitted = false;
      });
  }

  private saveText(content: string) {
    this.text = content;
    localStorage.setItem(TEXT, content);
  }
  handlePromptChange() {
    localStorage.setItem(PROMPT, this.prompt);
  }

  handleModeChange(event: any) {
    localStorage.setItem(MODE, event.value);
  }
}
