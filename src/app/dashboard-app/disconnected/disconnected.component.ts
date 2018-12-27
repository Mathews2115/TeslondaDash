import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Element } from '@angular/compiler';
import { appSize } from '../../app.config';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styles: [`
    :host {
      width: ${appSize.width}px;
      height: ${appSize.dashHeight}px;
      top: ${appSize.top}px;
    }
    canvas {
      width: 300px;
      height: 24px;
      top: 55px;
      position: relative;
      left: 32%;
    }
    .fg-text {
      font-size: 50px;
      top: 100px;
      position: relative;
    }
  `]
})
export class DisconnectedComponent implements OnDestroy, AfterViewInit {

  @ViewChild('teslondaLogo') _logo: ElementRef;
  private logoCtx: CanvasRenderingContext2D;
  private timerID: number;


  timer: number;
  text: string;
  timerOutput: string;
  constructor() {
    this.timer = 10;
    this.timerOutput = this.timer.toString();
    this.text = "CONTINUE?"
  }

  ngOnDestroy() {
    window.clearInterval(this.timerID);
  }

  ngAfterViewInit():void {
    const image = new Image();
    image.src = '../../assets/images/TeslondaLogoOrange.png';

    this.logoCtx = (<HTMLCanvasElement>this._logo.nativeElement).getContext('2d');
    this.logoCtx.imageSmoothingEnabled = false;
    this.logoCtx.mozImageSmoothingEnabled = false;
    this.logoCtx.webkitImageSmoothingEnabled = false;

    image.onload = () => this.logoCtx.drawImage(image, 0, 0, 300, 26);

    this.timerID = window.setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        this.timerOutput = this.timer.toString();
      } else {
        window.clearInterval(this.timerID);
        this.text = "GAME OVER"
        this.timerOutput = "";
      }
    }, 1100)
  }

}
