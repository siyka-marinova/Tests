import { Component, Inject, ViewChild, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { DataService } from './data.service';
import { GridModule } from '@progress/kendo-angular-grid';
import { products, Product } from './products';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GridDataResult, RowClassArgs } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { EditService } from './edit.service';

import { IntlService } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

export interface User {
    age: Number;
}

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['pdf-styles.css'],
  styles: [`
            .k-grid tr.even { background-color: #f45c42;}
            .k-grid tr.odd { background-color: #41f4df; color: #bababa;}
            .page-template {
                font-family: "DejaVu Sans", "Arial", sans-serif;
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                }

                .page-template .header {
                position: absolute;
                top: 30px;
                left: 30px;
                right: 30px;
                border-bottom: 1px solid #888;
                color: #888;
                }

                .page-template .footer {
                position: absolute;
                bottom: 30px;
                left: 30px;
                right: 30px;
                border-top: 1px solid #888;
                text-align: center;
                color: #888;
            }
        `],
  template: `
     <kendo-grid
          [data]="view | async"
          [height]="533"
          [pageSize]="gridState.take" [skip]="gridState.skip" [sort]="gridState.sort"
          [pageable]="true" [sortable]="true"
          [rowClass]="rowCallback"
          (dataStateChange)="onStateChange($event)"
          (edit)="editHandler($event)" (cancel)="cancelHandler($event)"
          (save)="saveHandler($event)" (remove)="removeHandler($event)"
          (add)="addHandler($event)"
        >
        <ng-template kendoGridToolbarTemplate>
            <button kendoGridAddCommand>Add new</button>
        </ng-template>
        <kendo-grid-column field="ProductName" title="Product Name"></kendo-grid-column>
        <kendo-grid-column field="UnitPrice" editor="numeric" title="Price"></kendo-grid-column>
        <kendo-grid-column field="Discontinued" editor="boolean" title="Discontinued"></kendo-grid-column>
        <kendo-grid-column field="UnitsInStock" editor="numeric" title="Units In Stock"></kendo-grid-column>
        <kendo-grid-command-column title="command" width="220">
            <ng-template kendoGridCellTemplate let-dataItem >
                <kendo-combobox [data]="listItems" [allowCustom]="allowCustom"></kendo-combobox>
                <button kendoButton (click)="doEdit(dataItem)" [bare]="true" [icon]="'edit'"></button>
                <button kendoButton (click)="doTrash(dataItem)" [bare]="true" [icon]="'trash'"></button>
            </ng-template>
        </kendo-grid-command-column>
      </kendo-grid>

    <p> New Grid</p>

    <kendo-grid [data]="gridData" [rowClass]="rowCallback">
        <kendo-grid-column field="ProductID" title="Product ID" width="120">
        </kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Product Name">
        </kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" width="230">
        </kendo-grid-column>
        <kendo-grid-column field="Discontinued" editor="boolean" title="Discontinued">
        </kendo-grid-column>
        <kendo-grid-command-column title="command" width="220">
            <ng-template kendoGridCellTemplate let-dataItem >
                <kendo-combobox [data]="listItems" [allowCustom]="allowCustom"></kendo-combobox>
                <button kendoButton (click)="doEdit(dataItem)" [bare]="true" [icon]="'edit'"></button>
                <button kendoButton (click)="doTrash(dataItem)" [bare]="true" [icon]="'trash'"></button>
            </ng-template>
        </kendo-grid-command-column>
        <kendo-grid-command-column title="Date" width="220">
            <ng-template kendoGridCellTemplate>
                <kendo-datepicker
                    [(value)]="value"
                ></kendo-datepicker>
            </ng-template>
        </kendo-grid-command-column>
    </kendo-grid>

    <kendo-grid [kendoGridBinding]="products" [pageable]="true" [pageSize]="10" [height]="430">
            <ng-template kendoGridToolbarTemplate>
                <button kendoGridPDFCommand><span class='k-icon k-i-file-pdf'></span>Export to PDF</button>
            </ng-template>
            <kendo-grid-column field="ProductID" width="100">
            </kendo-grid-column>
            <kendo-grid-column field="ProductName">
            </kendo-grid-column>
            <kendo-grid-pdf fileName="Products.pdf" paperSize="A4" [allPages]="true" [repeatHeaders]="true">
                <kendo-grid-pdf-margin top="2cm" left="1cm" right="1cm" bottom="2cm"></kendo-grid-pdf-margin>
                <ng-template kendoGridPDFTemplate let-pageNum="pageNum" let-totalPages="totalPages">
                 <div class="page-template">
                    <div class="header">
                      <div style="float: right">Page {{ pageNum }} of {{ totalPages }}</div>
                      Multi-page grid with automatic page breaking
                    </div>
                    <div class="footer">
                      Page {{ pageNum }} of {{ totalPages }}
                    </div>
                  </div>
                </ng-template>
            </kendo-grid-pdf>
        </kendo-grid>
  `
})

export class AppComponent {

    public allowCustom: boolean = true;
    public listItems: Array<string> = ["Baseball", "Basketball", "Cricket", "Field Hockey", "Football", "Table Tennis", "Tennis", "Volleyball"];

    public value: Date = new Date(2000, 2, 10);
    private products: any[] = products;
    private gridData = [{
        "ProductID": 1,
        "ProductName": "Chai",
        "UnitPrice": 18.0000,
        "Discontinued": true
        }, {
        "ProductID": 2,
        "ProductName": "Chang",
        "UnitPrice": 19.0000,
        "Discontinued": false
    }
    ];

     rowCallback(context: RowClassArgs) {
       const isEven = context.index % 2 == 0;
       return {
           even: isEven,
           odd: !isEven
       };
    }

    doEdit(dataItem): void {
        console.log("Edit");
    }
    doTrash(dataItem): void {
       console.log("Trash");
    }

public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 10
    };
    public formGroup: FormGroup;

    private editService: EditService;
    private editedRowIndex: number;

    constructor(@Inject(EditService) editServiceFactory: any) {
        this.editService = editServiceFactory();
    }

    public ngOnInit(): void {
        this.view = this.editService.map(data => process(data, this.gridState));

        this.editService.read();
    }

    public onStateChange(state: State) {
        this.gridState = state;

        this.editService.read();
    }

    protected addHandler({sender}) {
        this.closeEditor(sender);

        this.formGroup = new FormGroup({
            'ProductID': new FormControl(),
            'ProductName': new FormControl("", Validators.required),
            'UnitPrice': new FormControl(0),
            'UnitsInStock': new FormControl("", Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,2}')])),
            'Discontinued': new FormControl(false)
        });

        sender.addRow(this.formGroup);
    }

    protected editHandler({sender, rowIndex, dataItem}) {
        this.closeEditor(sender);

        this.formGroup = new FormGroup({
            'ProductID': new FormControl(dataItem.ProductID),
            'ProductName': new FormControl(dataItem.ProductName, Validators.required),
            'UnitPrice': new FormControl(dataItem.UnitPrice),
            'UnitsInStock': new FormControl(dataItem.UnitsInStock, Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,2}')])),
            'Discontinued': new FormControl(dataItem.Discontinued)
        });

        this.editedRowIndex = rowIndex;

        sender.editRow(rowIndex, this.formGroup);
    }

    protected cancelHandler({sender, rowIndex}) {
        this.closeEditor(sender, rowIndex);
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    protected saveHandler({sender, rowIndex, formGroup, isNew}) {
        const product: Product = formGroup.value;

        this.editService.save(product, isNew);

        sender.closeRow(rowIndex);
    }

    protected removeHandler({dataItem}) {
        this.editService.remove(dataItem);
    }
}
