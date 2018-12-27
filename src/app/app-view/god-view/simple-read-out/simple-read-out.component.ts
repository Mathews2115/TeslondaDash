import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sp-read-out',
  templateUrl: './simple-read-out.component.html',
  styleUrls: ['./simple-read-out.component.css']
})
export class SimpleReadOutComponent implements OnInit {

  @Input() label: string;
  @Input() readout: string;
  @Input() symbol: string;
  @Input() max: string;
  constructor() { }

  ngOnInit() {
  }

}
