import { Component, OnInit } from '@angular/core';
import { HSRComm } from '../../hsr-drive/comm.service';

@Component({
  selector: 'app-app-view-component',
  templateUrl: './app-view-component.component.html',
  styleUrls: ['./app-view-component.component.css']
})
export class AppViewComponentComponent implements OnInit {
  rebootStatus: string;
  constructor(readonly hsrComm: HSRComm) {
    this.rebootStatus = '';
  }

  reboot() {
    this.rebootStatus = 'pressed';
    setTimeout(window.location.reload());
  }
  ngOnInit() {}
}
