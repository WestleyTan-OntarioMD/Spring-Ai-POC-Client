import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  sessionKey = localStorage.getItem('sessionKey') || '';

  loading = false;

  constructor(private apiService: ApiService) {
    this.apiService.loading$.subscribe((loading) => (this.loading = loading));
  }
  ngOnInit(): void {
    this.apiService.fetchAgents();
  }
}
