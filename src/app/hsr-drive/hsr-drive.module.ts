// Client to HSR drive module
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HSRComm } from './comm.service';
import { SocketIoModule } from './socket-io/socket-io.module';
import { LogService } from './log.service';
import { VoltService } from './helpers/volt.service';
import { TempService } from './helpers/temp.service';

@NgModule({
  imports: [
    CommonModule,
    SocketIoModule,
  ],
  declarations: [],
  providers: [HSRComm, LogService, VoltService, TempService]
})
export class HsrDriveCommModule { }
