import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IMeData, ISession } from '@core/interfaces/session.interface';
import { LOGIN_QUERY, ME_DATA_QUERY } from '@graphql/operations/query/user';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {

  accessVar = new Subject<IMeData>();
  accessVar$ = this.accessVar.asObservable();

  constructor(apollo: Apollo) {
    super(apollo);
  }

  updateSession(newValue: IMeData) {
    this.accessVar.next(newValue);
  }

  start(){
    if (this.getSession() !== null){
      this.getMe().subscribe((result: IMeData) => {
        if (!result.status) {
          this.resetSession();
          return;
        }
        this.updateSession(result);
      });
      console.log('sesion iniciada');
      return;
    }
    this.updateSession({
      status: false
    });
    console.log('Sesion no iniciada');
  }
  // Añadir metodos para consumir metodos de la API
  login(email: string, password: string) {
    return this.get(LOGIN_QUERY, {email, password, include: false}).pipe(
      map((result: any) => {
        return result.login;
      })
    );
  }

  getMe() {
    return this.get(ME_DATA_QUERY, {
      include: false
    }, {
      headers: new HttpHeaders ({
        Authorization: (this.getSession() as ISession).token
      })
    }).pipe(map((result: any) => {
      return result.me;
    }));
  }

  setSesion(token: string, expiresTimeInHours = 24) {
    const date = new Date();
    console.log(date.toISOString());
    date.setHours(date.getHours() + expiresTimeInHours);

    const session: ISession = {
      expiresIn: new Date(date).toISOString(),
      token
    };
    localStorage.setItem('session', JSON.stringify(session));
  }

  getSession() {
    return JSON.parse(localStorage.getItem('session'));
  }

  resetSession() {
    localStorage.removeItem('session');
    this.updateSession({status: false});
  }
}
