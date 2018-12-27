import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WS_Events } from './events.enum';
import * as io from 'socket.io-client';       // socket.io js

@Injectable()
export class Socket {
  private socket: SocketIOClient.Socket;
  constructor() {  }

  public init(url:string) {
    this.socket = io(url);
  }

  public onEvent(event: WS_Events): Observable<any> {
    return new Observable<WS_Events>(observer => {
        this.socket.on(event, () => observer.next());
    });
  }

  public onMsg(event: any): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on(event, (data: any) => observer.next(data));
    });
  }

  public once(event: any): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on(event, (data: any) => {
          observer.next(data);
          observer.complete();
        });
    });
  }


  public send(channel: string, data: any, response: Function = () => {}) {
    this.socket.emit(channel, data, response);
  }
}
