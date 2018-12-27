import { WidgetBase } from '../widget';
import { colors, fonts } from '../../../app.config';

export interface SpeedoOptions {
  x: number,  // starts at lower left (so usually pass in canvas width)
  y: number,  // starts at lower left (so usually pass in canvas height)
  w: number,  // strokeWidth - size of the notches
  r: number,  // radius length - usually save to just go with canvas.height
  bgColor: string,
  color: string,
}

const notchSize = 2;

export class QtrSweepMeter extends WidgetBase {
  private maxUnits: number;
  private radius: number;
  private i: number; // cache forloop to avoid garbage colleciton
  private notchesToDraw: number;
  private lastDrawnNotch: number;
  private step: number;


  constructor(ctx: CanvasRenderingContext2D, readonly options: SpeedoOptions) {
    super(ctx, ctx.canvas);
    this.pixelizeCanvas();
    this.maxUnits = 90; // 1/4 sweep, 0-90
    this.step = 3;      // draw every 5th notch
    this.notchesToDraw = this.lastDrawnNotch = 0;

    // set initial background (no transparency)
    this.ctx.fillStyle = colors.background;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.lineWidth = this.options.w;
    this.ctx.strokeStyle = this.options.color;
  }

  draw(newSpeed: number=0): void {
    if (newSpeed !== this.lastDrawnNotch) {
      this.notchesToDraw = Math.min(newSpeed, this.maxUnits); // cap out at max unit
      this.notchesToDraw = this.nearest(this.notchesToDraw, this.step); // round to nearest increment of 5
      this.drawNotches();                                      // draw notches
      this.lastDrawnNotch = this.notchesToDraw;                // cache last drawn value
    }
  }

  private drawNotches(): void {
    if (this.notchesToDraw > this.lastDrawnNotch){
      this.growMeter()
    } else if (this.notchesToDraw < this.lastDrawnNotch) {
      this.shrinkMeter();
    }
  }

  private growMeter(): void {
    for (this.i = this.lastDrawnNotch; this.i < this.notchesToDraw; this.i+=this.step) {
      this.ctx.beginPath();
      this.ctx.arc(this.options.x, this.options.y, this.options.r,
          this.degToRad(180+this.i),            // from
          this.degToRad(180+this.i+notchSize),  // to
          false);
      this.ctx.stroke();
    }
  }

  // cover up notches since the value is reading lower
  private shrinkMeter(): void {
    this.ctx.save()
    this.ctx.beginPath();
      this.ctx.strokeStyle = this.options.bgColor;
      this.ctx.lineWidth = this.options.w+4;
      this.ctx.arc(this.options.x, this.options.y, this.options.r+1,
          this.degToRad(180+this.notchesToDraw-1),   // from (smaller)
          this.degToRad(180+this.lastDrawnNotch+1),  // last drawn (is bigger)
          false);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private nearest(x: number, step:number): number {
    return Math.ceil(x / step) * step;
  }
}
