import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, delay, filter, Subject, takeUntil, tap } from 'rxjs';
import { AgentTag } from 'src/app/models/agent-tag';
import { Report } from 'src/app/models/report';
import { ApiService } from 'src/app/services/api.service';
import * as dayjs from 'dayjs';
import { DurationUnitType } from 'dayjs/plugin/duration';

const PATTERN = /^\d+\s*(min|mins|hr|hrs|d|ds|wk|wks|mo|mos|yr|yrs)$|All/i;
const DEFAULT_WINDOW = '30 mins';
const WINDOW_KEY = 'WINDOW_KEY';

const MAP_TO_DAYJS: { [unit: string]: DurationUnitType } = {
  min: 'm',
  hr: 'h',
  d: 'D',
  wk: 'w',
  mo: 'M',
  yr: 'y',
};
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
        tap((val) => localStorage.setItem(WINDOW_KEY, val as string)),
        tap((val) => (this.lockbackWindowSelected = this.findMins(val))),
        takeUntil(this.destory$),
      )
      .subscribe(() => this.retrieveReports(this.selectedAgent as AgentTag));

    this.lookbackWindow.setValue(
      localStorage.getItem(WINDOW_KEY) || DEFAULT_WINDOW,
    );
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
    return dayjs
      .duration(parseInt(lw[0]), MAP_TO_DAYJS[lw[1].replace('s', '')])
      .asMinutes();
  }

  private loadLookbackOptions() {
    const labels: string[] = [
      DEFAULT_WINDOW,
      '60 mins',
      '90 mins',
      '2 hrs',
      '4 hrs',
      '8 hrs',
      '1 d',
      '2 ds',
      '1 wk',
      '2 wks',
      '1 mo',
      '3 mos',
      '6 mos',
      '1 yr',
      '2 yrs',
    ];
    this.lookbackOptions = [
      ...labels.map((label) => ({ label, value: this.findMins(label) })),
      { label: 'All', value: 99999999 },
    ];
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
