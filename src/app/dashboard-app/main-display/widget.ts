import { colors, fonts } from '../../app.config';

export interface RingParmas {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  r: number;
  w: number;
  color: string;
  startAngle?: number;   // The Arc start angle (defaults to 0 - (x,0) coordinates)
  stopAngle?: number;     // The Arc length - if nothing provided, we draw an entire circle/ring.
}

export interface Widget {
  draw(): void;
}

export abstract class WidgetBase implements Widget {
  abstract draw();

  constructor(readonly ctx: CanvasRenderingContext2D,
              readonly canvas: HTMLCanvasElement) {}

  // Draws text in background color
  drawBgText( msg: string, x: number, y: number, fontSize: number, align: string = 'center'): CanvasRenderingContext2D {
    this.ctx.textAlign = align;
    this.ctx.font = `${fontSize}px "${fonts.staticReadout}"`;
    this.ctx.fillStyle = colors.bgMain;
    this.ctx.fillText(msg, x, y);
    return this.ctx;
  }

  // dirty rect cleaning
  smartClear(fn: Function): CanvasRenderingContext2D {
    this.ctx.save();
    this.ctx.beginPath();
      this.ctx.strokeStyle = colors.background;
      this.ctx.fillStyle = colors.background;
      this.ctx.globalCompositeOperation = 'destination-out';
      fn();
    this.ctx.stroke();
    this.ctx.restore();
    return this.ctx;
  }

  strokePath(path: Path2D): CanvasRenderingContext2D {
    this.ctx.stroke(path);
    return this.ctx;
  }

  protected drawArc(options: RingParmas): CanvasRenderingContext2D {
    options.ctx.beginPath();
      options.ctx.strokeStyle = options.color;  // color of line/border
      options.ctx.lineWidth = options.w;
      options.ctx.arc(options.x, options.y, options.r, options.startAngle, options.stopAngle, false);
    options.ctx.stroke();
    return options.ctx;
  }

  // attempt to pixelize because we are up sampling to achieve a blocky look
  protected pixelizeCanvas(): void {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
  }

  protected drawArcMeter(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, w: number): CanvasRenderingContext2D {
    ctx.beginPath();
    ctx.moveTo(x, y);                             // Create a starting point
    ctx.arcTo(x, (y - r), (x + r), (y - r), r);   // outer curve up
    ctx.lineTo((x + r), (y - r) + w);             // line down
    ctx.arcTo(x + w, y - r + w, x + w, y, r - w); // curve down
    ctx.closePath();
    return ctx;
  }

  protected createOffscreenCanvas(width: number, height: number): CanvasRenderingContext2D {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    return offscreenCanvas.getContext('2d');
  }

  protected degToRad(angle: number) {
    // Degrees to radians
    return ((angle * Math.PI) / 180);
  }

  protected radToDeg(angle: number) {
    // Radians to degree
    return ((angle * 180) / Math.PI);
  }
}
