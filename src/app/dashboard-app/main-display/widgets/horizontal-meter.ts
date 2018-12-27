import { WidgetBase } from '../widget';
import { colors, fonts, percColors } from '../../../app.config';

const gapW = 2;
const fontSize = '16';
const lineWidth = 4;

export interface MeterOptions {
  symbol?: string,
  symbolColor?: string,
  symbolWidth?: number, // in px
  maxUnits: number,
  unitColor?: string,
}

export interface HMDrawOptions {
  color?: string;
  newPercent?: number;
}

export class HorizontalMeter extends WidgetBase {
  prevUnitsDrawn: number;
  unitsDrawn: number;
  color?: string;
  readonly unitWidth: number;
  readonly symbolWidth: number;
  readonly maxUnits: number;
  readonly meterWidth: number;
  readonly meterX: number;

  // optimize garbage collection; keep local varibles here
  lastDrawnUnit: number;  // current x location of meter rendering
  i: number;             // for loops

  constructor(ctx: CanvasRenderingContext2D, options: MeterOptions) {
      super(ctx, ctx.canvas);
      this.i = 0;               // for loop stuff - cached to remove garbage collection need
      this.lastDrawnUnit = 0;   // cached for garbage collection purposes
      this.prevUnitsDrawn = 0;  // amount of blocks currently drawn
      this.unitsDrawn = 0;      // amount of blocks to draw on screen
      this.maxUnits = options.maxUnits;
      this.color = options.unitColor;

      //  Here is how the meter is laid out - symbol on left, meter on right
      // [------------- canvas.width -----------------------------]
      //
      // |  gapW symbol gapW  | gapW UNIT gapW UNIT gapW UNIT etc |
      //
      // [------symbolWidth---]
      //                      ^meterX
      //                      [-----------meterWidth--------------]
      if (options.symbol) {
        this.symbolWidth =  gapW + options.symbolWidth + gapW;
      }
      else {
        // else no symbol, set width, etc to 0
        this.symbolWidth = gapW;
      }

      // prepare drawing info
      this.unitWidth = Math.floor((this.ctx.canvas.width - this.symbolWidth - (gapW * this.maxUnits)) / this.maxUnits);
      this.meterWidth = this.ctx.canvas.width - this.symbolWidth;
      this.meterX = this.symbolWidth + gapW;  // where meter starts

      // set initial background (no transparency)
      this.ctx.fillStyle = colors.background;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

       // prepare ctx
       this.ctx.fillStyle = this.color;

      if (options.symbol) {
         this.drawSymbol(options);
      }
  }

  draw(options?: HMDrawOptions): void {
    if(options){
      this.unitsDrawn = options.newPercent !== null ? this.percent2Units(options.newPercent) : this.unitsDrawn;

      // update color if provided
      if(options.color) {
        this.color = options.color;
      }

      // only draw something has changed
      if (this.prevUnitsDrawn !== this.unitsDrawn || options.color !== this.ctx.fillStyle) {
        // starting point for drawing
        this.lastDrawnUnit = this.meterX + ((gapW+this.unitWidth) * this.prevUnitsDrawn);

        // new percent is less - erase blocks
        if(this.prevUnitsDrawn > this.unitsDrawn) {
          this.ctx.fillStyle = colors.background;
          this.eraseUnits(this.prevUnitsDrawn, this.unitsDrawn);

        } else if (this.prevUnitsDrawn < this.unitsDrawn) {
          // new number is bigger; draw blocks
          this.ctx.fillStyle = options.color || this.color;
          this.drawUnits(this.prevUnitsDrawn, this.unitsDrawn);
        }

        // draw a dash if units are zero but there is still like 1% or whatever
        if(this.unitsDrawn === 0 && options.newPercent > 0) {
          this.lastDrawnUnit = this.meterX;
          this.ctx.fillStyle = options.color || this.color;
          this.ctx.beginPath();
          this.ctx.rect(this.lastDrawnUnit, Math.floor(this.ctx.canvas.height/3), this.unitWidth, Math.floor(this.ctx.canvas.height/3));
          this.ctx.fill();
        }

        this.prevUnitsDrawn = this.unitsDrawn;
      }
    }
  }

  // the symbol on the left of the meter
  private drawSymbol(options: MeterOptions): void {
    const x = gapW+(Math.floor(lineWidth/2));
    const y = Math.floor(lineWidth/2);

    this.ctx.save()
      this.ctx.font = `${fontSize}px "${fonts.staticReadout}"`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.strokeStyle = options.symbolColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.fillStyle = options.symbolColor;
      this.ctx.fillText(options.symbol, Math.round(this.symbolWidth/2), Math.round(this.ctx.canvas.height/2)+1);
      this.ctx.strokeRect(x, y, this.symbolWidth-lineWidth-gapW, this.ctx.canvas.height - lineWidth);
    this.ctx.restore()
  }

  private percent2Units(newPercent: number) : number {
    return Math.round((newPercent/100) * this.maxUnits);
  }

  private drawUnits(from: number, to: number): void {
    for (this.i = from; this.i < to ; this.i++) {
      if (!this.color) {
        this.ctx.fillStyle = this.unitColor(Math.round(this.i/this.maxUnits*100));
      }
      this.ctx.beginPath();
      this.ctx.rect(this.lastDrawnUnit, 0, this.unitWidth, this.ctx.canvas.height); // draw unit
      this.ctx.fill();
      this.lastDrawnUnit = this.lastDrawnUnit + this.unitWidth + gapW;          // advance to next unit
    }
  }

  private eraseUnits(prev: number, to: number): void {
    this.ctx.beginPath();
      for (this.i = prev; this.i > to ; this.i--) {
        this.lastDrawnUnit = this.lastDrawnUnit - (this.unitWidth + gapW);            // go back to prev unit
        this.ctx.rect(this.lastDrawnUnit, 0, this.unitWidth, this.ctx.canvas.height); // draw unit
      }
    this.ctx.fill();
  }

  private updateLastDrawnX(): void {
    this.lastDrawnUnit = this.meterX + ((gapW+this.unitWidth) * this.prevUnitsDrawn);
  }

  private unitColor(percent: number): string {
    if (percent < 20) {
      return percColors.low;
    } else if (percent < 40) {
      return percColors.lownormal;
    } else if (percent < 60) {
      return percColors.normal;
    } else if (percent < 70) {
      return percColors.medium;
    } else if (percent < 85) {
      return percColors.warning;
    } else if (percent <= 100) {
      return percColors.alert;
    } else {
      return percColors.normal;
    }
  }
}
