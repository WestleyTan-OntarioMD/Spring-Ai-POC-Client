import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  delay,
  filter,
  map,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { Conversation } from 'src/app/models/conversation';
import { Report } from 'src/app/models/report';
import { ApiService } from 'src/app/services/api.service';

const CONVERSATION_WITH_HQ = 'CONVERSATION_WITH_HQ';
@Component({
  selector: 'app-agent-portal',
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.scss'],
})
export class AgentPortalComponent implements OnInit, OnDestroy {
  message = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(1000),
  ]);
  buttonDisabled = false;
  response = '';
  identification = '';
  conversations$ = new BehaviorSubject<Conversation[]>(
    this.locallyStoredConversations(this.identification),
  );
  reports$ = new BehaviorSubject<Report[]>([]);
  agents$ = this.apiService.agents$;

  destroyed$ = new Subject<void>();
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.message.valueChanges
      .pipe(
        map((val: string | null) => val?.trim() || ''),
        filter((val: string) => !!val),
        map((val: string) => val.charAt(0).toUpperCase() + val.slice(1)),
        takeUntil(this.destroyed$),
      )
      .subscribe((v) => this.message.setValue(v, { emitEvent: false }));
  }

  fetchReports() {
    this.apiService.listReportsByAgent(60, '');
    // .subscribe((reports) => (this.reports = reports));
  }

  sendRequest() {
    if (this.message.invalid) return;

    this.buttonDisabled = true;
    const message = this.message.value as string;
    this.apiService
      .requestToHQ(message)
      .pipe(
        tap((con) => {
          this.saveConversationLocally(this.identification, message, true);
          this.saveConversationLocally(this.identification, con.message, false);
          this.message.reset();
          this.buttonDisabled = false;
        }),
        delay(500),
        tap(() =>
          this.conversations$.next(
            this.locallyStoredConversations(this.identification),
          ),
        ),
        delay(500),
      )
      .subscribe(() => this.scrollToBottom());
  }

  private saveConversationLocally(
    identification: string | null,
    message: string,
    isUser: boolean,
  ) {
    const conversations = this.locallyStoredConversations(identification);
    const con = new Conversation();
    con.createDt = new Date();
    con.message = message;
    con.user = isUser;
    conversations.push(con);
    if (conversations.length >= 10) conversations.shift();

    const conversationsMap = JSON.parse(
      localStorage.getItem(CONVERSATION_WITH_HQ) || JSON.stringify({}),
    );

    conversationsMap[identification || 'anonymous'] = conversations;
    localStorage.setItem(
      CONVERSATION_WITH_HQ,
      JSON.stringify(conversationsMap),
    );
  }

  private locallyStoredConversations(
    identification: string | null,
  ): Conversation[] {
    const key = identification || 'anonymous';
    const conversationsMap = JSON.parse(
      localStorage.getItem(CONVERSATION_WITH_HQ) || JSON.stringify({}),
    );

    return conversationsMap[key] || [];
  }

  scrollToBottom() {
    const el = document.getElementById('bottom-placeholder');
    el?.scrollIntoView();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

interface IConversationsMap {
  [identification: string]: Conversation[];
}
