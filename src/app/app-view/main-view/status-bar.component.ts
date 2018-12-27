import { Component, Input, HostBinding, OnChanges, OnInit } from '@angular/core';
import { colors, percColors } from '../../app.config';


export interface StatusBarData {
  title: string;
  value?: string;
  alert: boolean;
  class?: string;
}

@Component({
  selector: 'status-bar',
  template: `
    <span> {{ data.title }}</span>
    <span *ngIf="data.value"> {{ data.value }} </span>
  `,
  styles: [`
    :host {
      margin-bottom: 5px;
      display: flex;
      flex:1;
    }

    span {
      position: relative;
      display: inline-block;
      padding: 0px 10px;
      line-height: 35px;
      color: white;
      margin-right: 5px;
      flex: 0 1;
      flex-basis: auto;
    }
    span:first-child {
      flex: 1;
    }
    span:after {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      transform: skew(-9deg);
      z-index: -1;
      transition: background 0.8s;
    }

    :host:first-child {
      margin-top: 25px;
    }

    :host:first-child span {
      text-align: center;
      font-style: italic;
      color: ${colors.background};
    }

    :host:first-child span:after {
      background: ${colors.fgMain}
    }

    :host:nth-child(0n+2) span:after {
      background: #00b4f0;
    }

    :host:nth-child(0n+3) span:after {
      background: #f0b400;
    }

    :host:nth-child(0n+4) span:after {
      background: #f0b400;
    }

    :host:nth-child(1n+5) span:after {
      background: ${percColors.warning};
    }

    :host.alert span:after {
      background: red;
    }
    :host.alert {
      color: white;
    }

    :host.warning span,
    :host.medium span,
    :host.lownormal span,
    :host.low span,
    :host.white span{
      color: black;
    }

    :host.warning span:after {
      background: ${percColors.warning};
    }
    :host.medium span:after {
      background: ${percColors.medium};
    }
    :host.lownormal span:after {
      background: ${percColors.lownormal};
    }
    :host.low span:after {
      background: ${percColors.low};
    }
    :host.white span:after {
      background: white;
    }

    :host.normal span {
      color: black;
      line-height: 30px;
      font-size: 12px;
    }
    :host.normal span:after {
      background: ${colors.fgMainOff};
    }
    :host.normal.alert span:after {
      background: ${colors.fgMain};
    }

    // --------------------------------

    :host.creep span:after,
    :host.traction span:after {
      background: ${colors.fgMain};
    }

    :host.creep.alert span:after,
    :host.traction.alert span:after {
      background: ${colors.fgMainOff};
    }

    :host.regen span:after {
      background: ${colors.bgMainSecondary};
    }
    :host.regen.alert span:after {
      background: ${colors.bgMainSecondary};
    }

    :host.chooch span:after {
      background: ${percColors.medium};
    }
    :host.chooch.alert span:after {
      background: ${percColors.warning};
    }


  `],
})
export class StatusBarComponent implements OnChanges, OnInit {
  @Input() data: StatusBarData;
  @HostBinding('class') private classes: string;

  ngOnInit() {
    this.updateClasses();
  }

  ngOnChanges() {
    this.updateClasses();
  }


  private updateClasses() {
    if (this.data.alert) {
      this.classes = 'alert'
    }else {
      this.classes = '';
    }

    if(this.data.class) {
      this.classes = this.classes + ` ${this.data.class}`;
    }
  }
}
