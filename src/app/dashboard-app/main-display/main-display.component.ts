import { Component, OnInit } from '@angular/core';

// app imports
import { appSize } from '../../app.config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [`
    :host {
      width: ${appSize.width}px;
      height: ${appSize.dashHeight}px;
      top: ${appSize.top}px;
    }`]
})
export class MainDisplayComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
