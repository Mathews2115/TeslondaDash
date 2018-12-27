import { WidgetBase, RingParmas } from '../widget';
import { isUndefined, isNumber, isString } from 'util';

export interface RingWidgetOptions {
  readonly radius: number;   // radius of the power meter circle
  readonly arcWidth: number; // size/width of the ring
}

export interface RingUpdateParams {
  color?: string;
  speed?: number;
}

export class RingWidget extends WidgetBase {
  private degrees: number;
  private readonly ringOptions: RingParmas;
  private readonly cleanUpOptions: RingParmas;
  private rotateSpeed: number;

  /**
   * Ring Widget - draws an arc or circle and has the option of animating it
   * @param ctx          canvas context
   * @param options      RingWidgetOptions - location/size of ring/arc
   * @param color        initial color of the arc/ring
   * @param arcDegrees   length of arc - if nothing provided, full ring/arc will be drawn
   * @param startDegrees start of the arc - if nothing provided, starts at 0 degrees.  pointing right (x,0)
   * @param rotateSpeed  if number provided, will rotate at x degrees per frame
   */
  constructor(readonly ctx: CanvasRenderingContext2D,
              readonly options: RingWidgetOptions,
              color: string,
              readonly arcDegrees: number = 0,
              startDegrees: number = 0,
              rotateSpeed: number = 0) {
    super(ctx, ctx.canvas);
    this.pixelizeCanvas();
    this.degrees = startDegrees;

    // ring options for drawing the ring
    this.ringOptions = {
      ctx: this.ctx,
      x: Math.floor(this.canvas.width / 2),  // x - center of canvas
      y: Math.floor(this.canvas.height / 2), // y - center of canvas
      r: this.options.radius,
      w: this.options.arcWidth,
      color: color,
      startAngle: startDegrees > 0 ? this.degToRad(startDegrees) : 0,
      stopAngle: this.arcDegrees > 0 ? this.degToRad(startDegrees + this.arcDegrees) : (Math.PI * 2)
    };

    // ring options used 'dirty rect' cleanup) - make radius a bit wider to clear any interpolation the browser did on scaling up
    this.cleanUpOptions = {
      ctx: this.ctx, color: color, x: this.ringOptions.x, y: this.ringOptions.y, r: this.ringOptions.r, w: this.ringOptions.w + 1,
      startAngle: this.ringOptions.startAngle,
      stopAngle:  this.ringOptions.stopAngle,
    };
  }

  draw(options:RingUpdateParams={}): void {

    if (isNumber(options.speed)) {
      this.rotateSpeed = options.speed;
    }

    if ((isNumber(this.rotateSpeed) && this.rotateSpeed !== 0)) {
      this.animate();
    }

    if (!isUndefined(options.color)) {
      this.ringOptions.color = options.color;
    }
    this.drawArc(this.ringOptions);
  }

  private animate(): void {
    // clean up our previous dirty trail (avoids using a ctx.clearRect)
    this.cleanUpOptions.startAngle = this.degToRad(this.degrees - this.rotateSpeed);
    this.cleanUpOptions.stopAngle = this.degToRad(this.degrees + this.rotateSpeed);
    this.smartClear(() => { this.drawArc(this.cleanUpOptions); });

    // for next draw - get new degree angle
    this.degrees = this.degrees + this.rotateSpeed;
    if (this.degrees === 360) {
      this.degrees = 0;
    }

    // new location of angle
    this.ringOptions.startAngle = this.degToRad(this.degrees);
    this.ringOptions.stopAngle = this.degToRad(this.degrees + this.arcDegrees);
  }
}
