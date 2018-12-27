// Angular imports
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// App imports
import { HsrDriveCommModule } from './hsr-drive/hsr-drive.module';
import { AppComponent } from './app.component';
import { AnimHookService } from './anim-hook.service';
import { AlertWatcherService } from './alert-watcher.service';
import { DashboardAppModule } from './dashboard-app/dashboard-app.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HsrDriveCommModule,
    DashboardAppModule
  ],
  providers: [AnimHookService, AlertWatcherService],
  bootstrap: [AppComponent]
})
export class AppModule { }
