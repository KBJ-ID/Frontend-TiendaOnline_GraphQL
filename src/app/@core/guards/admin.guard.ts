import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivateChild {

  constructor(private auth: AuthService, private router: Router) {}

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      // Primero comprobar que existe sesión
      if (this.auth.getSession() !== null) {
        const dataDecode : any = this.decodeToken();
      // Comprobar que el token no esta vencido
        if (dataDecode.exp < new Date().getTime() / 1000) {
        console.log('session caducada');
        return this.redirect();
      }
      // El role del usuario es ADMIN
        if (dataDecode.user.role === 'ADMIN') {
        console.log('Somos administradores');
        return true;
      }
        console.log('No Somos administradores');
      }
      return this.redirect();
  }
  redirect(){
    this.router.navigate(['/login']);
    return false;
  }

    decodeToken(){
    return jwtDecode(this.auth.getSession().token);
  }
}

