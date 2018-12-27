import { Directive, OnInit, Input, HostBinding, DoCheck } from '@angular/core';
import { percColors, colors } from '../../app.config';

@Directive({
  selector: '[vertGauge]'
})
export class VertGaugeComponent implements DoCheck {
  @Input() max: number;
  @Input() min: number;
  @Input() value: number;
  @HostBinding('style.transform') private sizeStyle: string;
  @HostBinding('style.background') private background: string;
  constructor() {
    this.min = 0;
    this.max = 0;
    this.value = 0;
    this.background = `${percColors.normal}`;
  }

  ngDoCheck() {
    let percentage = (Math.abs(100 * (this.value-this.min)) / (this.max-this.min));
    percentage = Math.max(percentage, 0);

    if (Number.isNaN(percentage)) {
      this.background = `${percColors.normal}`;
      this.sizeStyle = `scaleY(${0})`;
    } else {
      this.sizeStyle = `scaleY(${percentage/100})`;
      if (percentage > 84) {
        this.background = `${colors.fgMainSecondary}`;
      } else if (percentage > 65) {
        this.background = `${percColors.normal}`;
      } else if (percentage > 35){
        this.background = `${percColors.warning}`;
      } else {
        this.background = `${percColors.alert}`;
      }
    }

  }
}
