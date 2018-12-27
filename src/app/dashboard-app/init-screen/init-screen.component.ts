import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// app imports
import { appSize, colors } from '../../app.config';

enum SCREENS {
  TITLE = "title",
  HIGH_SCORE = "high_score"
}

@Component({
  selector: 'app-init-screen',
  templateUrl: './init-screen.component.html',
  styles: [`
    :host {
      overflow: hidden;
      position: absolute;
      display: inline;
      width: 740px;
      height: 426px;
      left: 30px;
      top: 42px;
    }
    @keyframes arrive-animation {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(0%);
      }
    }
    .logo {
      width: 600px;
      height: 52px;
      top: 50px;
      position: relative;
      left: 68px;
    }
    .car {
      animation: arrive-animation linear 2s;
      width: 377px;
      height: 165px;
      top: 148px;
      position: absolute;
      left: 25%;
    }



    .scores {
      width: 95%;
      margin: 0 auto;
    }

    .scores td {
      width: 33.3%;
    }

    td:nth-child(2) {
      text-align: center;
    }

    td:last-child {
      text-align: right;
    }

    #demo .coin_msg,
    #title_page .coin_msg {
      animation: blink-animation 3s steps(5, start) infinite;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: black;
      padding: 10px;
    }


    .hs_title{
      color: ${colors.fgMainSecondary};
      text-align: center;
    }

    .high_scores_container {
      position: relative;
      top: 40px;
    }

    .high_scores_container .coin_msg {
      animation: blink-animation 3s steps(5, start) infinite;
      text-align: center;
    }

    .high_scores {
      color: white;
      margin: 0 auto;
    }

    @keyframes color-change {
      0% { color: ${colors.fgMainSecondary}; }
      50% { color: ${colors.bgMain}; }
      100% { color: ${colors.fgMainSecondary}; }
    }

    .top_score {
      animation: color-change 1s infinite;
    }

    .high_scores th {
      color: ${colors.fgMain};
      width: 140px;
      padding-bottom: 10px;
    }

    .high_scores td {
      padding-bottom: 8px;
    }

    .high_scores th:first-child {
        text-align: left;
    }

    .high_scores td:nth-child(3) {
      text-align: center;
    }

    .high_scores th:last-child {
      text-align: right;
    }
    `]
})
export class InitScreenComponent implements AfterViewInit {

  // canvas rendering stuff
  @ViewChild('teslondaLogo') _logo: ElementRef;
  @ViewChild('teslondaCar') _car: ElementRef;
  private logoCtx: CanvasRenderingContext2D;
  private carLogoCtx: CanvasRenderingContext2D;
  private animTimeoutID: number;
  screen: SCREENS;

  constructor() {
    this.screen = SCREENS.TITLE;
    this.animTimeoutID = window.setTimeout(() => {
      this.screen = SCREENS.HIGH_SCORE;
    }, 7000);
    // this timeout correlates with app.component.ts's demo state (HACK HACK HACK PROTOTYPE UGLY ASS CODE)
  }

  ngAfterViewInit():void {
    const image = new Image();
    image.src = '../../assets/images/TeslondaLogoOrange.png';

    this.logoCtx = (<HTMLCanvasElement>this._logo.nativeElement).getContext('2d');
    this.logoCtx.imageSmoothingEnabled = false;
    this.logoCtx.mozImageSmoothingEnabled = false;
    this.logoCtx.webkitImageSmoothingEnabled = false;

    image.onload = () => this.logoCtx.drawImage(image, 0, 0, 300, 26);

    const carImage = new Image();
    carImage.src = '../../assets/images/TeslondaCarLogoOrange.png';

    this.carLogoCtx = (<HTMLCanvasElement>this._car.nativeElement).getContext('2d');
    this.carLogoCtx.imageSmoothingEnabled = false;
    this.carLogoCtx.mozImageSmoothingEnabled = false;
    this.carLogoCtx.webkitImageSmoothingEnabled = false;
    carImage.onload = () => this.carLogoCtx.drawImage(carImage, 0, 0, 377, 165);

  }

  ngOnDestroy() {
    window.clearTimeout(this.animTimeoutID);
  }
}
