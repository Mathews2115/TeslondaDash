import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppViewComponentComponent } from './app-view-component/app-view-component.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';

import { CanDumperComponent } from './can-dumper/can-dumper.component';
import { AppViewRoutingModule } from './app-view-routing.module';
import { LogListComponent } from './can-dumper/log-list/log-list.component';
import { LogViewerComponent } from './can-dumper/log-viewer/log-viewer.component';
import { GameSpeakWindowComponent } from './game-speak-window/game-speak-window.component';
import { GodViewComponent } from './god-view/god-view.component';
import { SimpleReadOutComponent } from './god-view/simple-read-out/simple-read-out.component';
import { RingMeterComponent } from './god-view/ring-meter-component';
import { ReactiveLineComponent } from './god-view/reactive-line.component';
import { RingMeterCircleComponent } from './god-view/ring-meter-circle.component';
import { SpeedSectionComponent } from './god-view/speed-section/speed-section.component';
import { VoltSectionComponent } from './god-view/volt-section/volt-section.component';
import { VertGaugeComponent } from './god-view/vert-gauge.component';
import { TempSectionComponent } from './god-view/temp-section/temp-section.component';
import { MiscSectionComponent } from './god-view/misc-section/misc-section.component';
import { EditComponent } from './god-view/edit.component';
import { HomeComponent } from './god-view/home.component';
import { GameSpeakService } from './game-speak-window/game-speak.service';
import { MainViewComponent } from './main-view/main-view.component';
import { StatusBarComponent } from './main-view/status-bar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSliderModule,
    MatButtonModule,
    AppViewRoutingModule
  ],
  providers: [
    GameSpeakService,
  ],
  declarations: [
    AppViewComponentComponent,
    SimpleReadOutComponent,
    CanDumperComponent,
    LogListComponent,
    LogViewerComponent,
    GameSpeakWindowComponent,
    GodViewComponent,
    RingMeterComponent,
    ReactiveLineComponent,
    RingMeterCircleComponent,
    SpeedSectionComponent,
    VoltSectionComponent,
    VertGaugeComponent,
    TempSectionComponent,
    MiscSectionComponent,
    EditComponent,
    HomeComponent,
    MainViewComponent,
    StatusBarComponent
  ]
})
export class AppViewModule { }
