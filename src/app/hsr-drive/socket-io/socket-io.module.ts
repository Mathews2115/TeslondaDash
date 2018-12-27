import { NgModule } from '@angular/core';
import { Socket } from './socket.service'; // socket.io service (wraps up WebSocket and Socket.IO library)

@NgModule({
  imports: [
  ],
  declarations: [],
  providers: [Socket]
})
export class SocketIoModule { }
