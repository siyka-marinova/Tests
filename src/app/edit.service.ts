import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Jsonp } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'destroy';

@Injectable()
export class EditService extends BehaviorSubject<any[]> {
    constructor(private jsonp: Jsonp) {
        super([]);
    }

    private data: any[] = [];

    public read() {
        if (this.data.length) {
            return super.next(this.data);
        }

        this.fetch()
            .do(data => this.data = data)
            .subscribe(data => {
                super.next(data);
            });
    }

    public save(data: any, isNew?: boolean) {
        const action = isNew ? CREATE_ACTION : UPDATE_ACTION;

        this.reset();

        this.fetch(action, data)
            .subscribe(() => this.read(), () => this.read());
    }

    public remove(data: any) {
        this.reset();

        this.fetch(REMOVE_ACTION, data)
            .subscribe(() => this.read(), () => this.read());
    }

    public resetItem(dataItem: any) {
        if (!dataItem) { return; }

        //find orignal data item
        const originalDataItem = this.data.find(item => item.ProductID === dataItem.ProductID);

        //revert changes
        Object.assign(originalDataItem, dataItem);

        super.next(this.data);
    }

    private reset() {
        this.data = [];
    }

    private fetch(action: string = "", data?: any): Observable<any[]>  {
        return this.jsonp
            .get(`http://demos.telerik.com/kendo-ui/service/Products/${action}?callback=JSONP_CALLBACK${this.serializeModels(data)}`)
            .map(response => response.json());
    }

    private serializeModels(data?: any): string {
       return data ? `&models=${JSON.stringify([data])}` : '';
    }
}
