import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { enableProdMode } from '@angular/core';
import { Http, HttpModule, ConnectionBackend, BaseRequestOptions, Response, ResponseOptions, ResponseType } from '@angular/http';
import { Jsonp, JsonpModule } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { DataService }   from './data.service';
import { AppComponent }   from './app.component';
import { GridModule, PDFModule } from '@progress/kendo-angular-grid';
import { RTL } from '@progress/kendo-angular-l10n';
import { EditService } from './edit.service';
import {ButtonsModule} from "@progress/kendo-angular-buttons";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    GridModule,
    DateInputsModule,
    DropDownsModule,
    PDFModule,
    HttpModule,
    // ... and register it
    ReactiveFormsModule,
    ButtonsModule,
    JsonpModule
  ],
  bootstrap: [AppComponent],
  providers: [
        {
            deps: [Jsonp],
            provide: EditService,
            useFactory: (jsonp: Jsonp) => () => new EditService(jsonp)
        },
        // { provide: RTL, useValue: true }
  ]
})
export class AppModule { }
