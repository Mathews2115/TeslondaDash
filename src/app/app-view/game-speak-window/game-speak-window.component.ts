import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GameSpeakService } from './game-speak.service';
import { Subscription } from 'rxjs';
import { colors } from '../../app.config';

enum avatarAnim {
  talking = '../../../../assets/images/profiletalking.gif',
  idle = '../../../../assets/images/profileIdle.gif'
}

const TYPE_TIME = 35;
const DIALOG_BOX_H = 100;
const BORDER_SIZE = 5;
const BORDER_COLOR = 'gray';

@Component({
  selector: 'app-game-speak-window',
  templateUrl: './game-speak-window.component.html',
  styles: [`

    .typed_cursor {
      opacity: 1;
      animation: cursor-blink 0.6s infinite;
    }

    @keyframes cursor-blink{
      50% { opacity: 0.0; }
    }

    .i_line {
      width:100%;
      height: 5px;
      color: black;
      background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 100%);
      top:0;
      left:0;
      position: absolute;
      display: inline-block;
      animation: interferance_line_anim 3s linear infinite, cursor-blink 0.5s infinite;
    }

    @keyframes turn-off {
      0% {
        transform: scale(1, 0.8) translate3d(0, 0, 0);
      }
      60% {
        transform: scale(1.0, 0.001) translate3d(0, 0, 0);

      }
      100% {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
        transform: scale(0, 0.0001) translate3d(0, 0, 0);
      }
    }
    @keyframes turn-on {
      0% {
        transform: scale(0, 0.001) translate3d(0, 0, 0);
      }
      15% {
        transform: scale(1.2, 0.001) translate3d(0, 0, 0);
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
      }
      40% {
        transform: scale(1, 1) translate3d(0, 0, 0);
      }
      100% {

      }
    }

    @keyframes interferance_line_anim {
      0% {
        transform: translateY(${BORDER_SIZE}px);
      }
      100% {
        transform: translateY(${DIALOG_BOX_H + BORDER_SIZE + BORDER_SIZE}px);
      }
    }

    img {
      height: 100%;
      animation: turn-on 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      animation-fill-mode: forwards;
    }

    .image_container {
      height: 100%;
      padding: 10px;
      border: ${BORDER_SIZE}px solid ${BORDER_COLOR};
      position: relative;
    }

    .comm_container {
      background: ${colors.background};
      height: ${DIALOG_BOX_H}px;
      display: inline-flex;
      flex: 1 100%;
      align-items: center;
      margin: 0 auto;
    }

    .dialog_box {
      height: 100%;
      display: flex;
      flex: 1 100%;
      align-items: center;
      justify-content: center;
      border: ${BORDER_SIZE}px solid ${BORDER_COLOR};
      margin-left: 10px;
      padding: 10px;
      color: white;
      line-height: 1.4;
      overflow: hidden;
    }
    .dialog_box span {
      white-space: pre-wrap;
      flex:1;
    }

    :host {
      background: ${colors.background};
      padding: 25px 10px 14px;
      display: flex;
      flex-flow: row wrap;
      max-height: 110px;
    }
  `]
})
export class GameSpeakWindowComponent implements OnInit, OnDestroy {
  @Input() message: string;
  avatar: avatarAnim;
  typed: string = '';
  private i: number; // current letter index
  private timeoutID: number;
  private subscription: Subscription;

  constructor(readonly gameSpeakService: GameSpeakService) {
    this.avatar = avatarAnim.idle;
    this.i = 0;
  }

  ngOnInit() {
    this.subscription = this.gameSpeakService.broadcaster.subscribe(newMessage => {
      if (this.message != newMessage) {
        this.message = newMessage;
        this.i = 0;
        this.typed = '';
        this.typeMessage();
      }
    })
  }

  ngOnDestroy(){
    window.clearTimeout(this.timeoutID);
    this.subscription.unsubscribe();
  }

  private typeMessage = () => {
    if (this.i < this.message.length) {
      this.avatar = avatarAnim.talking;
      this.timeoutID = window.setTimeout(() => {
        this.typed = `${this.typed}${this.message.charAt(this.i)}`
        this.i++;
        this.typeMessage()
      }, TYPE_TIME);
    }
    else {
      this.avatar = avatarAnim.idle;
    }
  }
}
