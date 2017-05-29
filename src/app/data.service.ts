import { Injectable, Inject } from '@angular/core';
import { Jsonp, JsonpModule } from '@angular/http';
import { Product } from './product.model';
import { Observable } from 'rxjs/Rx';

@Injectable()

export class DataService {


  constructor(@Inject(Jsonp) private jsonp: Jsonp) { }

  fetchData(action: string = "", data?: Product): Observable<Product[]>{
    return this.jsonp.get(`http://demos.telerik.com/kendo-ui/service/Products/${action}?callback=JSONP_CALLBACK${this.serializeModels(data)}`).map(response => response.json())
  }

  private serializeModels(data?: Product): string {
    return data ? `&models=${JSON.stringify([data])}` : '';
  }

}