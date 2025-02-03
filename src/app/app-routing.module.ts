import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './HomePage/homepage.component';
import { ResultPageComponent } from './result-page/result-page.component';

const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'resultpage', component: ResultPageComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/home' } // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
