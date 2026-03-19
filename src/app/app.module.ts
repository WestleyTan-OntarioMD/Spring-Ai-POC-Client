import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppComponent } from './app.component';
import { AgentPortalComponent } from './components/agent-portal/agent-portal.component';
import { BatchProcessingComponent } from './components/batch-processing/batch-processing.component';
import { ChatComponent } from './components/chat/chat.component';
import { HqPortalComponent } from './components/hq-portal/hq-portal.component';
import { UploadComponent } from './components/upload/upload.component';
import { AppErrorHandler } from './services/app-error-handler';
import { SizePipe } from './services/size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    UploadComponent,
    BatchProcessingComponent,
    AgentPortalComponent,
    HqPortalComponent,
    SizePipe,
  ],
  imports: [
    FormsModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatInputModule,
    MatSelectModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    RouterModule.forRoot([
      {
        component: AgentPortalComponent,
        path: 'secure/agent',
      },
      {
        component: HqPortalComponent,
        path: 'secure/hq',
      },
      {
        component: ChatComponent,
        path: 'chat',
      },
      {
        component: UploadComponent,
        path: 'docs',
      },
      {
        component: BatchProcessingComponent,
        path: 'batch-processing',
      },
      { path: '', redirectTo: '/chat', pathMatch: 'full' },
    ]),
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
