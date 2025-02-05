import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/HomePage/homepage.component';
import { ResultPageComponent } from './components/result-page/result-page.component';

const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'resultpage', component: ResultPageComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
