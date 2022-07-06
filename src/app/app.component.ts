import { Component, OnInit } from '@angular/core';
import { slideInAnimation } from '../route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  //animations: [slideInAnimation],
})
export class AppComponent implements OnInit {
  constructor() {
    const path = window.location.pathname;
    if (path === '/') {
      window.location.replace('/create-token');
    }
  }

  ngOnInit(): void { }
}
