import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  submitted = false;

  copied = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  copy() {
    if (!this.text) return;
    navigator.clipboard.writeText(this.text);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
  onUpload() {
    if (!this.selectedFile || this.submitted) return;
    this.submitted = true;
    this.apiService
      .uploadFile(this.sessionId, this.selectedFile)
      .subscribe((res) => {
        this.text = res.body?.content || '';
        this.selectedFile = null;
        this.submitted = false;
      });
  }

  updateText(text: string) {
    this.text = text;
    localStorage.setItem(TEXT, text);
  }
}
