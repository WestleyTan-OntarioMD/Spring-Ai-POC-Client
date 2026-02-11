import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { delay, filter, Subject, takeUntil } from 'rxjs';
import { AgentTag } from 'src/app/models/agent-tag';
import { Report } from 'src/app/models/report';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-hq-portal',
  templateUrl: './hq-portal.component.html',
  styleUrls: ['./hq-portal.component.scss'],
})
export class HqPortalComponent implements OnInit, OnDestroy {
  destory$ = new Subject<void>();
  agents$ = this.apiService.agents$;
  selectedAgent: AgentTag | null = null;
  connected = false;
  lookbackWindow = new FormControl(15, [
    Validators.required,
    Validators.min(15),
    Validators.max(10080),
  ]);

  reports: Report[] = [];
  constructor(private apiService: ApiService) {}
  ngOnInit(): void {
    this.lookbackWindow.valueChanges
      .pipe(
        filter(() => !!this.selectedAgent),
        takeUntil(this.destory$),
      )
      .subscribe(() => this.retrieveReports(this.selectedAgent as AgentTag));
  }

  viewReportDetail(report: Report) {
    alert(report.message);
  }

  retrieveReports(agent: AgentTag) {
    this.connected = false;
    this.selectedAgent = agent;

    const minutes = this.lookbackWindow.value ?? 15;
    this.apiService
      .listReportsByAgent(minutes, agent.identification)
      .pipe(delay(2000))
      .subscribe((reports) => {
        this.connected = true;
        this.reports = reports;
      });
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
