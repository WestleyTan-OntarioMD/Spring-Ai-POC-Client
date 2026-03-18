import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, delay, filter, Subject, takeUntil, tap } from 'rxjs';
import { AgentTag } from 'src/app/models/agent-tag';
import { Report } from 'src/app/models/report';
import { ApiService } from 'src/app/services/api.service';

const PATTERN = /^\d+\s*(min|mins|hr|hrs|day|days)$/i;
const DEFAULT_WINDOW = '30 mins';
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

  lockbackWindowSelected = 30;
  lookbackWindow = new FormControl<string>('', [
    Validators.required,
    Validators.pattern(PATTERN),
  ]);
  lookbackOptions: ILookbackOption[] = [];

  reports: Report[] = [];
  constructor(private apiService: ApiService) {
    this.loadLookbackOptions();
  }
  ngOnInit(): void {
    this.lookbackWindow.valueChanges
      .pipe(
        filter(() => this.lookbackWindow.valid),
        debounceTime(1000),
        tap((val) => (this.lockbackWindowSelected = this.findMins(val))),
        takeUntil(this.destory$),
      )
      .subscribe(() => this.retrieveReports(this.selectedAgent as AgentTag));

    this.lookbackWindow.setValue(DEFAULT_WINDOW);
  }

  viewReportDetail(report: Report) {
    alert(report.message);
  }

  retrieveReports(agent: AgentTag | null) {
    this.connected = false;
    if (this.selectedAgent !== agent) this.selectedAgent = agent;
    else this.selectedAgent = null;

    this.apiService
      .listReportsByAgent(
        this.lockbackWindowSelected,
        this.selectedAgent?.identification,
      )
      .pipe(delay(500))
      .subscribe((reports) => {
        this.connected = true;
        this.reports = reports;
      });
  }

  private findMins(val: string | null): number {
    if (!val) return 30;

    const found = this.lookbackOptions.find((o) => o.label === val);
    if (found) return found.value;

    if (!PATTERN.test(val)) return 30;
    const lw = val.split(' ');
    if (lw[1].includes('min')) return parseInt(lw[0]);
    if (lw[1].includes('hr')) return parseInt(lw[0]) * 60;
    return parseInt(lw[0]) * 1440;
  }

  private loadLookbackOptions() {
    this.lookbackOptions = [
      { label: DEFAULT_WINDOW, value: 30 },
      { label: '45 mins', value: 45 },
      { label: '60 mins', value: 60 },
      { label: '90 mins', value: 90 },
      { label: '2 hrs', value: 120 },
      { label: '4 hrs', value: 240 },
      { label: '8 hrs', value: 480 },
      { label: '1 day', value: 1440 },
      { label: '2 days', value: 2880 },
    ];

    for (let i = 0; i < 10; i++) {
      const last = this.lookbackOptions[this.lookbackOptions.length - 1];
      this.lookbackOptions.push({
        label: `${parseInt(last.label) + 1} days`,
        value: last.value + 1440,
      });
    }
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}

interface ILookbackOption {
  label: string;
  value: number;
}
