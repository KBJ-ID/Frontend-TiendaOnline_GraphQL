import { Component, OnInit } from '@angular/core';
import { IMeData } from '@core/interfaces/session.interface';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  session: IMeData = {
    status: false
  };
  access = false;
  role: string;
  userLabel: string;

  constructor(private authService: AuthService) {
    this.authService.accessVar$.subscribe((result) =>{
      this.session = result;
      this.access = this.session.status;
      this.role = this.session.user?.role;
      this.userLabel = `${this.session.user?.name} ${this.session.user?.lastname}`;
    });
   }

  ngOnInit(): void {
  }

  logout(){
    this.authService.resetSession();
  }
}
