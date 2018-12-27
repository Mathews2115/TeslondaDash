import { Component, OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { HSRComm } from "../../../hsr-drive/comm.service";
import { Subscription } from "rxjs/Subscription";
import { MenuEvent } from "../menu-event.enum";
import { streamingItems } from "../stream-items";
import { GameSpeakService, GameSpeakObject } from "../../game-speak-window/game-speak.service";

const gettingLogMsg = 'Retrieving logs from Dash Interface...';
const selectLogMsg = 'Please select a log file to load!'
const noLogs = 'There are no log files present.'
const errorGettingLog = 'A̹̠̺̮ c͝r͍͈͓͖ḭ͉̗̞͠t̼͙̝̗͔͕͝ͅi̝̞̹̰̥ca̭̜̦l̬̱ ͇̺̲͈l͍͚̜̬̥͉o̗̼̟̫g̪̝̯͚͙i̬͇c̫ ͓͙͇͙͉e͏͈͔̻̱͖̝̩r̢̲̬͙̥̩ͅṛ̰ò͓r̛͚̱ ̜̣͔̼͇̜h̥̤̥̘͉̥́as̢̟̹̻̥̦ ͢oc̖͚̰̳cu̲͖͉̻̠͔͠r̙̙̫͓͇̀r͍͍̠͙̙̝͖͡e̠d͙͈̟͠!̕!̵͖̼̱͚͚͈'

@Component({
  selector: "app-log-list",
  templateUrl: "./log-list.component.html",
  styleUrls: ["./log-list.component.css"]
})
export class LogListComponent implements OnInit, OnDestroy {
  @Output() menuSelect = new EventEmitter<MenuEvent>();
  logFiles: string[];
  private _listLogsSub: Subscription;
  private gameObject: GameSpeakObject;

  constructor(readonly hsrComm: HSRComm,
    private speakService: GameSpeakService) {
    this.logFiles = [];
    this.gameObject = this.speakService.register( [gettingLogMsg]);
  }

  load(fileName: string) {
    this.hsrComm.loggerService.loadLog(fileName, streamingItems);
    this.menuSelect.emit(MenuEvent.VIEW);
  }

  onBack() {
    this.menuSelect.emit(MenuEvent.MENU);
  }

  private changeMsg(newMsg: string) {
    this.gameObject.update([newMsg]);
  }

  ngOnInit() {
    this._listLogsSub = this.hsrComm.loggerService.listLogs({
      next: (logs: string[]) => (this.logFiles = logs),
      error: (errorMsg: string)  => {
        if (errorMsg.toLowerCase().indexOf("no logs")  !== -1) {
          this.changeMsg(noLogs);
        } else {
          this.changeMsg(errorGettingLog);
          console.error(errorMsg);
        }
      },
      complete: ()  => {
        if(this.logFiles.length) {
          this.changeMsg(selectLogMsg);
        }
      }
    });
  }

  ngOnDestroy() {
    try {
      this.gameObject.dispose();
      this._listLogsSub.unsubscribe();
    } catch (error) {
      console.error(error);
    }
  }
}
