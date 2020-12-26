import { AuthGuard } from './auth/auth.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [ 
  { path: '', redirectTo: 'places', pathMatch: 'full'},
  { path: 'auth', loadChildren: './auth/auth.Module#AuthPageModule'},
  { path: 'places', loadChildren: './places/places.module#PlacesPageModule', canLoad: [AuthGuard]},
  { path: 'bookings', loadChildren: './bookings/bookings.module#BookingsPageModule', canLoad: [AuthGuard]}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }