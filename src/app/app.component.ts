import { Component, Inject, ViewChild, Input, ViewEncapsulation, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import { DataService } from './data.service';
import { GridModule } from '@progress/kendo-angular-grid';
import { products, Product } from './products';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GridDataResult, RowClassArgs, PageChangeEvent } from '@progress/kendo-angular-grid';
import { State, process, GroupDescriptor, DataResult } from '@progress/kendo-data-query';
import { EditService } from './edit.service';
import { sampleProducts } from "./products";
import { sampleCustomers } from "./customers";

import { IntlService } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings, SelectableMode } from '@progress/kendo-angular-grid';

export interface User {
    age: Number;
}

interface Item {
  text: string,
  value: number
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
        
            .example-wrapper,.example-col { 
                vertical-align: top;
            }
        `],
  template: `
    <p> Grid With Filtering </p>
    <div style="margin: 10px">
            <div class="card">
                <div class="card-block k-form">
                    <fieldset>
                    <legend>Selection Settings</legend>
                    <div class="k-form-field">
                        <span>Mode</span>
                        <input type="radio" name="mode" id="single" value="single" class="k-radio"
                            [(ngModel)]="mode" (change)="setSelectableSettings()">
                        <label class="k-radio-label" for="single">Single</label>
                        <input type="radio" name="mode" id="multiple" value="multiple" class="k-radio"
                            [(ngModel)]="mode" (change)="setSelectableSettings()">
                        <label class="k-radio-label" for="multiple">Multiple</label>
                    </div>

                    <label class="k-form-field">
                        <input type="checkbox" id="chkboxonly" class="k-checkbox" [(ngModel)]="checkboxOnly" (change)="setSelectableSettings()">
                        <label class="k-checkbox-label" for="chkboxonly">Use checkbox only selection</label>
                    </label>
                    </fieldset>
                </div>
            </div>
        </div>
    <kendo-grid
        [data]="firstGridData"
        [selectable]="selectableSettings"
        [pageSize]="state.take"
        [skip]="state.skip"
        [sort]="state.sort"
        [filter]="state.filter"
        [sortable]="true"
        [pageable]="true"
        [filterable]="true"
        (dataStateChange)="dataStateChange($event)"
    >
        <kendo-grid-column field="ProductID" title="ID" width="40" [filterable]="false">
        </kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Product Name" width="250" [locked]="true">
        </kendo-grid-column>
        <kendo-grid-column field="FirstOrderedOn" title="First Ordered On" width="240" filter="date" format="{0:d}">
        </kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" width="180" filter="numeric" format="{0:c}">
        </kendo-grid-column>
        <kendo-grid-column field="ProductID" title="ID" width="40" [filterable]="false">
        </kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Product Name" width="250">
        </kendo-grid-column>
        <kendo-grid-column field="FirstOrderedOn" title="First Ordered On" width="240" filter="date" format="{0:d}">
        </kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" width="180" filter="numeric" format="{0:c}">
        </kendo-grid-column>
        <kendo-grid-column field="ProductID" title="ID" width="40" [filterable]="false">
        </kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Product Name" width="250">
        </kendo-grid-column>
        <kendo-grid-column field="FirstOrderedOn" title="First Ordered On" width="240" filter="date" format="{0:d}">
        </kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" width="180" filter="numeric" format="{0:c}">
        </kendo-grid-column>
        <kendo-grid-column field="Discontinued" width="120" filter="boolean">
            <ng-template kendoGridCellTemplate let-dataItem>
                <input type="checkbox" [checked]="dataItem.Discontinued" disabled/>
            </ng-template>
        </kendo-grid-column>
    </kendo-grid>

    <p> Grid With Hidden Columns </p>
    <div class="example-config">
        <button (click)="restoreColumns()" class="k-button">Restore hidden columns</button>
    </div>

    <kendo-grid [data]="secondGridData" [selectable]="true">
        <kendo-grid-column-group title="gryoi">
            <ng-template ngFor [ngForOf]="columns" let-column let-index="index">
                <kendo-grid-column [width]="index == 1 ? 110 : 220"
                    field="{{column}}"
                    [hidden]="hiddenColumns.indexOf(column) > -1"
                >
                    <ng-template kendoGridHeaderTemplate let-dataItem>
                        {{dataItem.field}}
                        <button
                        (click)="hideColumn(dataItem.field)"
                        class="k-button k-primary"
                        style="float: right;"
                        >
                        Hide {{index}}
                        </button>
                    </ng-template>
                </kendo-grid-column>
            </ng-template>
        </kendo-grid-column-group>
    </kendo-grid>

    <p> Fancy Grid With Height </p>
    <input [(ngModel)]="gridHeight"/>
    GridHeith {{gridHeight}}
    <kendo-grid
        [data]="view | async"
        [pageSize]="gridState.take" [skip]="gridState.skip" [sort]="gridState.sort"
        [pageable]="true" [sortable]="true"
        [rowClass]="rowCallback"
        [height]="gridHeight"
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
        <ng-template kendoGridCellTemplate let-isNew="isNew">
            <button kendoGridEditCommand class="k-primary">Edit</button>
            <button kendoGridRemoveCommand>Remove</button>
            <button kendoGridSaveCommand [disabled]="formGroup?.invalid">{{ isNew ? 'Add' : 'Update' }}</button>
            <button kendoGridCancelCommand>{{ isNew ? 'Discard changes' : 'Cancel' }}</button>
            <kendo-combobox [data]="listItems" [allowCustom]="allowCustom"></kendo-combobox>
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

    <p> Grid With Export To PDF </p>
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

    <p> Grid With Grouping </p>
    <kendo-grid
          [groupable]="true"
          [data]="gridView"
          [group]="groups"
          (groupChange)="groupChange($event)"
        >
        <kendo-grid-column field="ProductID" title="ID" [width]="80"></kendo-grid-column>
        <kendo-grid-column field="ProductName" title="Name" [width]="300"></kendo-grid-column>
        <kendo-grid-column field="UnitPrice" title="Unit Price" [width]="120"></kendo-grid-column>
        <kendo-grid-column field="Category.CategoryName" title="Category">
            <ng-template kendoGridGroupHeaderTemplate let-value="value">
                {{value}}
            </ng-template>
        </kendo-grid-column>
      </kendo-grid>

    <p> OnPush Change detection - ComboBox </p>
    <div class="example-config">
        Selected Value: {{selectedValue}}
    </div>
    <button (click)="selectedValue = (selectedValue + 1) % 3">next</button>
    <kendo-combobox
        [data]="comboListItems"
        textField="text"
        valueField="value"
        [valuePrimitive]="true"
        [(ngModel)]="selectedValue"
    >
    </kendo-combobox>

    <p> OnPush Change detection - DropdownList </p>
    <form #form="ngForm">
        <div class="example-config">
            Selected Value: {{selectedValue}}
        </div>
        <button (click)="selectedValue = (selectedValue + 1) % 3">next</button>
        <div class="example-wrapper">
            <label>
                Select Gender:
                <kendo-dropdownlist
                    name="gender"
                    [data]="genders"
                    [textField]="'text'"
                    [valueField]="'value'"
                    [valuePrimitive]="true"
                    [(ngModel)]="selectedValue"
                >
                </kendo-dropdownlist>
            </label>
        </div>
    </form>

    <kendo-dropdownlist [data]="['1','2','3']"></kendo-dropdownlist>

    <p> ComboBox Test </p>
    <div class="example-wrapper">
      <p>Sports:</p>
      <kendo-dropdownlist [data]="listItems">
      </kendo-dropdownlist>
    </div>
    ChangeDetectionStrategy.OnPush - Notice how the dropdown isn't updated on first select, only on second click
  `,
//   changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {

    private groups: GroupDescriptor[] = [{ field: "Category.CategoryName" }];

    private gridView: DataResult;

    private loadProducts(): void {
        this.gridView = process(products, { group: this.groups });
    }

    public groupChange(groups: GroupDescriptor[]): void {
        this.groups = groups;
        this.loadProducts();
    }

    public genders: Array<Item> = [
        { text: "Male", value: 0 },
        { text: "Female", value: 1 },
        { text: "Other", value: 2 }
    ];

    // public gender: { text: string, value: number } = { text: "Female", value: 2 };

    public comboListItems: Array<Item> = [
        { text: 'Small', value: 0 },
        { text: 'Medium', value: 1 },
        { text: 'Large', value: 2 }
    ];

    public selectedValue: number = 2;
    private gridHeight = 450;
    public allowCustom: boolean = true;
    public listItems: Array<string> = ["Baseball", "Basketball", "Cricket", "Field Hockey", "Football", "Table Tennis", "Tennis", "Volleyball"];

    public value: Date = new Date(2000, 2, 10);
    private products: any[] = products;

    private state: State = {
        skip: 0,
        take: 5
    };

    private firstGridData: GridDataResult = process(sampleProducts, this.state);

    protected dataStateChange(state: State): void {
        this.state = state;
        this.firstGridData = process(sampleProducts, this.state);
    }

    private checkboxOnly: boolean = false;
    private mode: SelectableMode = "multiple";
    private selectableSettings: SelectableSettings;

    private setSelectableSettings() {
        this.selectableSettings = {
            mode: this.mode,
            checkboxOnly: this.checkboxOnly
        }
    }

    public secondGridData: any[] = sampleCustomers;

    public columns: string[] = [
      "CompanyName", "ContactName", "ContactTitle"
    ];

    public hiddenColumns: string[] = [];

    public restoreColumns(): void {
        this.hiddenColumns = [];
    }

    public hideColumn(field: string): void {
        this.hiddenColumns.push(field);
    }

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
        this.setSelectableSettings();
    }

    public ngOnInit(): void {
        this.view = this.editService.map(data => process(data, this.gridState));
        this.editService.read();
        this.loadProducts();
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
