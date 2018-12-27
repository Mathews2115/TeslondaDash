import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// app route imports
import { DashboardAppComponent } from './dashboard-app/dashboard-app/dashboard-app.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dash',
    pathMatch: 'full'
  },
  {
    path: 'dash',
    component: DashboardAppComponent
  },
  {
    path: 'app',
    loadChildren: 'app/app-view/app-view.module#AppViewModule' //'app/orders/orders.module#OrdersModule'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
