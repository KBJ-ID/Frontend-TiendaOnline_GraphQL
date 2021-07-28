import { Component, OnInit } from '@angular/core';
import { IRegisterForm } from '@core/interfaces/register.interface';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { USER_LIST_QUERY } from '@graphql/operations/query/user';
import { optionsWithDetails, userFormBasicDialog } from '@shared/alerts/alerts';
import { basicAlert } from '@shared/alerts/toasts';
import { TYPE_ALERT } from '@shared/alerts/values.config';
import { DocumentNode } from 'graphql';
import { UsersAdminService } from './users-admin.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  query: DocumentNode = USER_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;

  constructor(private usersAdminService: UsersAdminService) {

  }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 5;
    this.resultData = {
      listKey: 'users',
      definitionKey: 'users'
    };
    this.include = true;
    this.columns = [
      {
        property: 'id',
        label: '#'
      },
      {
        property: 'name',
        label: 'Nombre'
      },
      {
        property: 'lastname',
        label: 'Apellidos'
      },
      {
        property: 'email',
        label: 'Correo Electronico'
      },
      {
        property: 'role',
        label: 'Permisos'
      },

    ];
  }

  private initializeForm(user: any) {
    const defaultName = (user.name !== undefined && user.name !== '') ? user.name : '';
    const defaultLastName = (user.lastname !== undefined && user.lastname !== '') ? user.lastname : '';
    const defaultEmail = (user.email !== undefined && user.email !== '') ? user.email : '';
    const roles = new Array(2);
    roles[0] = user.role !== undefined && user.role === 'ADMIN' ? 'selected' : '';
    roles[1] = user.role !== undefined && user.role === 'CLIENT' ? 'selected' : '';

    return  `<input id="name" value="${defaultName}" class="swal2-input" placeholder="Nombre" required>
              <input id="lastname" value="${defaultLastName}" class="swal2-input" placeholder="Apellidos" required>
              <input id="email" value="${defaultEmail}" class="swal2-input" placeholder="correo electronico" required>
              <select id="role" class="swal2-input">
                <option value="ADMIN" ${roles[0]}>Administrador</option>
                <option value="CLIENT" ${roles[1]}>Cliente</option>
              </select>
              `;
  }

  async takeAction($event) {
    // Obtener informacion del genero seleccionado
    const action = $event[0];
    const user = $event[1];
    // Asignamos un valor por defecto
    const html = this.initializeForm(user);

    // Teniendo en cuenta el caso, ejecutar una acción
    switch (action) {
      case 'add':
        // Añadir el item
        this.addForm(html);
        break;

      case 'edit':
        // Añadir el item
        this.updateForm(html, user);
        break;

      case 'info':
        const result = await optionsWithDetails('Detalles', `${user.name} ${user.lastname}</br> <i class="fas fa-envelope-open-text"></i>&nbsp;${user.email}`, 375, '<i class="fas fa-edit"></i> Editar', // true
          '<i class="fas fa-lock"></i> Bloquear'); // false
        if (result) {
          this.updateForm(html, user);

        } else if (result === false) {
          this.blockForm(user);
        }
        break;

      case 'block':
        this.blockForm(user);
        break;

      default: break;
    }
  }

  private async addForm(html: string) {
    const result = await userFormBasicDialog('Añadir Usuario', html);
    console.log(result);
    this.addUser(result);
  }

  private addUser(result) {
    if (result.value) {
      const user: IRegisterForm = result.value;
      user.password = '1234';
      user.active = false;
      this.usersAdminService.register(user).subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.status) {
            basicAlert(TYPE_ALERT.SUCCESS, resp.message);
            return;
          }
          basicAlert(TYPE_ALERT.WARNING, resp.message);
        }
      );
    }
  }

  private async updateForm(html: string, user: any) {
    const result = await userFormBasicDialog('Modificar Usuario', html);
    console.log(result);
    this.addUser(result);
    this.updateUser(result, user.id);
  }

  private updateUser(result, id: string) {
    if (result.value) {
      const user = result.value;
      user.id = id;
      this.usersAdminService.update(result.value).subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.status) {
            basicAlert(TYPE_ALERT.SUCCESS, resp.message);
            return;
          }
          basicAlert(TYPE_ALERT.WARNING, resp.message);
        }
      );
    }
  }

  private async blockForm(user: any) {
    const result = await optionsWithDetails('¿Quieres bloquear?', `Si bloqueas el usuario seleccionado, no se mostrara en la lista`, 430, 'No, no bloquear', 'Si, bloquear');
    if (result === false) {
      this.blockUser(user.id);
    }
  }

  private blockUser(id: string) {
    this.usersAdminService.block(id).subscribe(
      (resp: any) => {
        console.log(resp);
        if (resp.status) {
          basicAlert(TYPE_ALERT.SUCCESS, resp.message);
          return;
        }
        basicAlert(TYPE_ALERT.WARNING, resp.message);
      }
    );
  }
}


