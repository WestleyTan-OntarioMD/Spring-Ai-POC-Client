import { Component, OnInit } from '@angular/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import { interval } from 'rxjs';

import { ApiService } from './services/api.service';

dayjs.extend(utc);
dayjs.extend(duration);
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  sessionKey = localStorage.getItem('sessionKey') || '';

  constructor(private apiService: ApiService) {
    // manual backend renewal
    interval(420000).subscribe(() => this.apiService.healthCheck(1000));
  }
  ngOnInit(): void {
    this.apiService.healthCheck();
    this.apiService.fetchAgents();
  }
}
