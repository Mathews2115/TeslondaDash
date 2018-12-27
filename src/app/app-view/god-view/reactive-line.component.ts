import { Component, OnInit, Input, DoCheck } from "@angular/core";
import { colors, percColors } from "../../app.config";

enum actionState {
  LITTLE = 1,
  SOME = 15,
  ALOT = 40,
  MAX = 60
}

enum powerState {
  NONE,
  REGEN,
  POWER
}

export enum LINE_MODE {
  PERCENT_PERFORMANCE,
  POWER_STATUS, // All = green for regen, bright orange for power - dark orange nothing
  REGEN_STATUS, // shows if regen or not
  DISCHARGE_STATUS // shows if power or not
}

@Component({
  selector: "reactive-line",
  template: `<svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline [attr.points]="points" [ngStyle]="{'stroke':strokeColor, 'stroke-width.px': strokeWidth}" style="fill:none;"></polyline>
              </svg>
            `,
  styles: [
    `
      :host {
        height: 100%;
      }
      polyline {
        transition: 0.8s;
        will-change: stroke;
      }
    `
  ]
})
export class ReactiveLineComponent implements DoCheck {
  @Input() points: string[];
  @Input() max?: number;
  @Input() value: number;
  @Input() min?: number;
  @Input() mode?: LINE_MODE;
  @Input() strokeWidth?: number;
  private oldValue: number;
  strokeColor: string;
  constructor() {
    this.value = 0;
    this.oldValue = 0;

    if (!this.strokeWidth) {
      this.strokeWidth = 4;
    }
    if (!this.max) {
      this.max = 0;
    }
    if (!this.mode) {
      this.mode = LINE_MODE.PERCENT_PERFORMANCE;
    }
    this.strokeColor = this.getInitColor(this.mode);
  }

  private getInitColor(mode: LINE_MODE): string {
    if (mode == LINE_MODE.PERCENT_PERFORMANCE) {
      return colors.background;
    } else if (mode == LINE_MODE.POWER_STATUS) {
      return colors.bgMain;
    } else if (mode == LINE_MODE.REGEN_STATUS) {
      return colors.bgMainSecondary;
    } else if (mode == LINE_MODE.DISCHARGE_STATUS) {
      return colors.bgMain;
    }
  }

  ngDoCheck() {
    if (this.value != this.oldValue) {
      this.oldValue = this.value;
      if (this.mode == LINE_MODE.PERCENT_PERFORMANCE) {
        let current = (100 * this.value) / this.max;
        if (current < actionState.LITTLE) {
          this.strokeColor = colors.background;
        } else if (current < actionState.SOME) {
          this.strokeColor = percColors.normal;
        } else if (current < actionState.ALOT) {
          this.strokeColor = percColors.medium;
        } else if (current < actionState.MAX) {
          this.strokeColor = percColors.warning;
        } else {
          this.strokeColor = percColors.alert;
        }
      } else if (this.mode == LINE_MODE.POWER_STATUS) {
        if (this.value < 0) {
          this.strokeColor = colors.fgMainSecondary;
        } else if (this.value > 0) {
          this.strokeColor = colors.fgMain;
        } else {
          this.strokeColor = colors.bgMain;
        }
      } else if (this.mode == LINE_MODE.REGEN_STATUS) {
        if (this.value < 0) {
          this.strokeColor = colors.fgMainSecondary;
        } else {
          this.strokeColor = colors.bgMainSecondary;
        }
      } else if (this.mode == LINE_MODE.DISCHARGE_STATUS) {
        if (this.value > 0) {
          this.strokeColor = colors.fgMain;
        } else {
          this.strokeColor = colors.bgMain;
        }
      }
    }
  }
}
