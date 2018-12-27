import { Directive, OnInit, Input, HostBinding, DoCheck } from '@angular/core';
import { colors, percColors } from '../../app.config';

enum actionState {
  LITTLE = 1,
  SOME = 35,
  ALOT = 65,
}
enum speedState {
  NONE,
  SLOW,
  MEDIUM,
  FAST
}

@Directive({
  selector: '[ringCircle]',
})
export class RingMeterCircleComponent implements DoCheck {
  @Input() max: number;
  @Input() value: number;
  @Input() reverse: boolean; //true if this supports reverse action
  @HostBinding('class') private classes: string;
  constructor() {

  }

  // dumb way to do this;  next time, I'll just have an inside div using ngClass
  private setState(newState: speedState) {
    switch (newState) {
      case speedState.NONE:
        this.classes = 'circle'
        break;
      case speedState.SLOW:
        this.classes = 'circle slow'
        break;
      case speedState.MEDIUM:
        this.classes = 'circle medium'
        break;
      case speedState.FAST:
        this.classes = 'circle fast'
        break;
      default:
        this.classes = 'circle'
        break;
    }
    if (this.reverse && this.value < 0) {
      this.classes = this.classes + ' reverse';
    }
  }

  ngDoCheck() {
    let current = (Math.abs(100 * this.value) / this.max);
    if (current > actionState.ALOT) {
      this.setState(speedState.FAST);
    } else if (current > actionState.SOME) {
      this.setState(speedState.MEDIUM);
    } else if (current > actionState.LITTLE) {
      this.setState(speedState.SLOW);
    } else {
      this.setState(speedState.NONE);
    }
  }
}
