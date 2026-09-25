import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { InventarioComponent } from './inventario.component';
import { VentasComponent } from './ventas.component';
// 1. Añadimos la importación provisional del nuevo componente
import { ComprasComponent } from './compras.component';
import { ReportesComponent } from './reportes.component';

@NgModule({
  declarations: [
    AppComponent,
    InventarioComponent,
    VentasComponent,
    ComprasComponent
    ReportesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
