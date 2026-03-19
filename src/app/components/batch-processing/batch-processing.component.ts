import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

const TEXT = 'APP_FILE_TEXT';
const MODE = 'APP_FILE_MODE';
@Component({
  selector: 'app-batch-processing',
  templateUrl: './batch-processing.component.html',
  styleUrls: ['./batch-processing.component.scss'],
})
export class BatchProcessingComponent {
  sessionId = localStorage.getItem('sessionId') || '';

  text = localStorage.getItem(TEXT) || '';

  selectedFileNames: Set<string> = new Set();
  selectedFiles: File[] = [];

  submitted = false;

  copied = false;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any) {
    const files = event.target.files;

    for (const file of files) {
      if (!this.selectedFileNames.has(file.name)) {
        this.selectedFileNames.add(file.name);
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(file: File) {
    if (!this.selectedFileNames.has(file.name)) return;

    const index = this.selectedFiles.findIndex((f) => f.name === file.name);
    if (index < 0) return;

    this.selectedFiles.splice(index, 1);
    this.selectedFileNames.delete(file.name);
  }

  onUpload(fileInput: HTMLInputElement) {
    if (this.selectedFileNames.size === 0 || this.submitted) return;
    this.submitted = true;
    this.saveText('');
    // this.apiService
    //   .uploadFile(this.sessionId, this.prompt, this.useMode, this.selectedFile)
    //   .subscribe((res) => {
    //     this.saveText(res?.content);

    //     fileInput.value = '';
    //     this.selectedFile = null;
    //     this.submitted = false;
    //   });
  }

  private saveText(content: string | null) {
    this.text = content || '';
    localStorage.setItem(TEXT, this.text);
  }
  handlePromptChange() {
    // localStorage.setItem(PROMPT, this.prompt);
  }

  handleModeChange(event: any) {
    localStorage.setItem(MODE, event.value);
  }
}
