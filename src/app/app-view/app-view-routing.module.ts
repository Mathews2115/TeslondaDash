import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// app route imports
import { GodViewComponent } from '../app-view/god-view/god-view.component';
import { AppViewComponentComponent } from '../app-view/app-view-component/app-view-component.component';
import { CanDumperComponent } from '../app-view/can-dumper/can-dumper.component';
import { EditComponent } from './god-view/edit.component';
import { HomeComponent } from './god-view/home.component';
import { MainViewComponent } from './main-view/main-view.component';

const routes: Routes = [
  {
    path: '',
    component: AppViewComponentComponent,
    children:[
      {
        path: 'godview',
        component: GodViewComponent,
        children:[
          { path: '', component: HomeComponent },
          { path: ':id',  component: EditComponent }
        ]
      },
      { path: 'dump', component: CanDumperComponent },
      { path: 'main', component:  MainViewComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppViewRoutingModule { }
