import { Component, OnInit } from '@angular/core';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { GENRE_LIST_QUERY } from '@graphql/operations/query/genre';
import { formBasicDialog, optionsWithDetails } from '@shared/alerts/alerts';
import { basicAlert } from '@shared/alerts/toasts';
import { TYPE_ALERT } from '@shared/alerts/values.config';
import { DocumentNode } from 'graphql';
import { GenresService } from './genres.service';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss']
})
export class GenresComponent implements OnInit {

  query: DocumentNode = GENRE_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;

  constructor(private service: GenresService) { }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'genres',
      definitionKey: 'genres'
    };
    this.include = false;
    this.columns = [
      {
        property: 'id',
        label: '#'
      },
      {
        property: 'name',
        label: 'Nombre del género'
      },
      {
        property: 'slug',
        label: 'Slug'
      }
    ];
  }

  async takeAction($event) {
    // Obtener informacion del genero seleccionado
    const action = $event[0];
    const genre = $event[1];
    // Asignamos un valor por defecto
    const defaultValue = (genre.name !== undefined && genre.name !== '') ? genre.name : '';
    const html = `<input id="name" value="${defaultValue}" class="swal2-input" required>`;

    // Teniendo en cuenta el caso, ejecutar una acción
    switch (action) {
      case 'add':
        // Añadir el item
        this.addForm(html);
        break;

      case 'edit':
        // Añadir el item
        this.updateForm(html, genre);
        break;

      case 'info':
        const result = await optionsWithDetails('Detalles', `${genre.name} (${genre.slug})`, 375, '<i class="fas fa-edit"></i> Editar', // true
          '<i class="fas fa-lock"></i> Bloquear'); // false
        if (result) {
          this.updateForm(html, genre);

        } else if (result === false) {
          this.blockForm(genre);
        }
        break;

      case 'block':
        this.blockForm(genre);
        break;

      default: break;
    }
  }

  private async addForm(html: string) {
    const result = await formBasicDialog('Añadir género', html, 'name');
    this.addGenre(result);
  }

  private addGenre(result) {
    if (result.value) {
      this.service.add(result.value).subscribe(
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

  private async updateForm(html: string, genre: any) {
    const result = await formBasicDialog('Modificar género', html, 'name');
    this.updateGenre(genre.id, result);
  }

  private updateGenre(id: string, result) {
    if (result.value) {
      this.service.update(id, result.value).subscribe(
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

  private blockGenre(id: string) {
    this.service.block(id).subscribe(
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

  private async blockForm(genre: any) {
    const result = await optionsWithDetails('¿Quieres bloquear?', `Si bloqueas el item seleccionado, no se mostrara en la lista`, 430, 'No, no bloquear', 'Si, bloquear');
    if (result === false) {
      this.blockGenre(genre.id);
    }
  }

}
