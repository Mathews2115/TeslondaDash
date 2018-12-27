import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainDisplayComponent } from './main-display/main-display.component';
import { PowerMeterComponent } from './main-display/power-meter/power-meter.component';
import { LimitsComponent } from './main-display/limits/limits.component';
import { SpeedoComponent } from './main-display/speedo/speedo.component';
import { GearIndicatorComponent } from './main-display/gear-indicator/gear-indicator.component';
import { IndicatorsComponent } from './main-display/indicators/indicators.component';
import { VoltagesComponent } from './main-display/voltages/voltages.component';
import { TemperaturesComponent } from './main-display/temperatures/temperatures.component';
import { InitScreenComponent } from './init-screen/init-screen.component';
import { DisconnectedComponent } from './disconnected/disconnected.component';
import { PedalPosComponent } from './main-display/pedal-pos/pedal-pos.component';
import { DashboardAppComponent } from './dashboard-app/dashboard-app.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [DashboardAppComponent,
    MainDisplayComponent,
    PowerMeterComponent,
    LimitsComponent,
    SpeedoComponent,
    GearIndicatorComponent,
    IndicatorsComponent,
    VoltagesComponent,
    TemperaturesComponent,
    InitScreenComponent,
    DisconnectedComponent,
    PedalPosComponent]
})
export class DashboardAppModule { }
