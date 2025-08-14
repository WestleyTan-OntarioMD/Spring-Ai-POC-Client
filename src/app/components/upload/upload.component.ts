import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

const TEXT = 'APP_FILE_TEXT';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  sessionId = localStorage.getItem('sessionId') || '';
  text = localStorage.getItem(TEXT) || '';
  selectedFile: File | null = null;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile) return;
    this.apiService
      .uploadFile(this.sessionId, this.selectedFile)
      .subscribe((res) => res.body?.content);
  }

  updateText(text: string) {
    this.text = text;
    localStorage.setItem(TEXT, text);
  }
}
