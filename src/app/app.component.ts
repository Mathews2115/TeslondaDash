import { Component } from '@angular/core';
import { HSRComm } from './hsr-drive/comm.service';
import { SERVER_URL } from './app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [` `]
})

export class AppComponent {
  constructor(private hsrComm: HSRComm) {
    this.hsrComm.init(SERVER_URL)
  }
}
