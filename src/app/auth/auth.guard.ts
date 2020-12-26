import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, UrlSegment, Router, CanLoad } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Route } from '@angular/compiler/src/core';
import { switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router){}

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    
      if(!this.authService.userIsAuthenticated){
        this.router.navigateByUrl('/auth');
      }

      return this.authService.userIsAuthenticated.pipe(
        take(1),
        switchMap( isAuthenticated => {
          if ( !isAuthenticated) {
            return this.authService.autoLogin();
          }
          else
          {
            return of(isAuthenticated);
          }
        }),
        tap(isAuthenticated => {
          if (!isAuthenticated) {
            this.router.navigateByUrl('/auth');
          }
        })
      );
  }
  
}
