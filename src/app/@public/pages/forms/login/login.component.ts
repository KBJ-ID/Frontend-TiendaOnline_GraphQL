import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ILoginForm, IResultLogin } from '@core/interfaces/login.interface';
import { AuthService } from '@core/services/auth.service';
import { TYPE_ALERT } from '@shared/alerts/values.config';
import { basicAlert } from 'src/app/@shared/alerts/toasts';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  login: ILoginForm = {
    email: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router) { }

  init(){
    console.log(this.login);
    this.auth.login(this.login.email, this.login.password).subscribe(
      (result: IResultLogin) => {
        console.log(result);
        if (result.status){
          if (result.token !== null) {
            console.log('inicio de sesion');
            // Guardamos la sesion
            basicAlert(TYPE_ALERT.SUCCESS, result.message);
            this.auth.setSesion(result.token);
            this.auth.updateSession(result);
            this.router.navigate(['/home']);
            return;
          }
          basicAlert(TYPE_ALERT.WARNING, result.message);
          return;
        }
        basicAlert(TYPE_ALERT.INFO, result.message);
        console.log('sesion no iniciada');
      }
    );
  }

}
