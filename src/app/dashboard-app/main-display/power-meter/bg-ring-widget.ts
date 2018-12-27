import { WidgetBase, RingParmas } from '../widget';
import { colors } from '../../../app.config';
import { isUndefined, isNumber, isString } from 'util';

export interface BgRingWidgetOptions {
  powerColor: string;
  regenColor: string;
  radius: number;
  arcWidth: number;
}

export enum BgRingType {
  POWER = 0,
  REGEN = 1
}

enum DrawType {
  DRAW = 0,
  CLEAN = 1
}

export class BgRingWidget extends WidgetBase {
  private readonly color: string[];
  private readonly cleanUpArcWidth: number;
  private readonly ring: Array<Path2D>;

  /**
   * Ring Widget - draws an arc or circle and has the option of animating it
   * @param ctx          canvas context
   * @param options      RingWidgetOptions - location/size of ring/arc
   */
  constructor(readonly ctx: CanvasRenderingContext2D,
              options: BgRingWidgetOptions) {
    super(ctx, ctx.canvas);
    this.pixelizeCanvas();

    this.color = [
      options.powerColor,
      options.regenColor
    ]

    // ring options for drawing the ring
    const drawOptions = {
      x: Math.floor(this.canvas.width / 2),  // x - center of canvas
      y: Math.floor(this.canvas.height / 2), // y - center of canvas
      r: options.radius,
      startAngle: 0,
      stopAngle: Math.PI * 2
    };
    // ring options used 'dirty rect' cleanup) - make radius a bit wider to clear any interpolation the browser did on scaling up
    let cleanOptions = Object.assign({}, drawOptions);
    cleanOptions.r = cleanOptions.r - 1;
    this.cleanUpArcWidth =  options.arcWidth + 3

    this.ring = [
      new Path2D(),
      new Path2D()
    ];
    this.ring[DrawType.DRAW].arc(drawOptions.x, drawOptions.y, drawOptions.r, drawOptions.startAngle, drawOptions.stopAngle, false);
    this.ring[DrawType.CLEAN].arc(cleanOptions.x, cleanOptions.y,cleanOptions.r, cleanOptions.startAngle, cleanOptions.stopAngle, false);

    this.ctx.lineWidth = options.arcWidth;
  }

  draw(ringType: BgRingType=BgRingType.POWER): void {
    this.ctx.save();
      this.ctx.strokeStyle = colors.background;
      this.ctx.lineWidth = this.cleanUpArcWidth;
      this.strokePath(this.ring[DrawType.CLEAN]);
    this.ctx.restore();

    this.ctx.strokeStyle = this.color[ringType];  // color of line/border
    this.strokePath(this.ring[DrawType.DRAW]);
  }
}
