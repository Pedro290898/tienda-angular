import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-inventario',
  template: `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #e9ecef;">
      <h3 style="margin-top: 0; color: #333;">📦 Agregar Producto al Inventario</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <div style="flex: 2; min-width: 200px;">
          <label style="display:block; font-size:12px; margin-bottom:3px;">Nombre del Producto:</label>
          <input type="text" [(ngModel)]="nuevoProd.nombre" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
        </div>
        <div style="flex: 1; min-width: 100px;">
          <label style="display:block; font-size:12px; margin-bottom:3px;">Precio ($):</label>
          <input type="number" [(ngModel)]="nuevoProd.precio" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
        </div>
        <div style="flex: 1; min-width: 100px;">
          <label style="display:block; font-size:12px; margin-bottom:3px;">Cantidad (Stock):</label>
          <input type="number" [(ngModel)]="nuevoProd.stock" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
        </div>
        <div style="flex: 1; min-width: 120px; display: flex; align-items: flex-end;">
          <button (click)="guardar()" style="width:100%; padding:10px; background-color: #28a745; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">＋ Guardar</button>
        </div>
      </div>
    </div>

    <h3>📋 Lista de Existencias</h3>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background-color: #007bff; color: white;">
          <th style="padding: 10px; border: 1px solid #dee2e6;">ID</th>
          <th style="padding: 10px; border: 1px solid #dee2e6;">Producto</th>
          <th style="padding: 10px; border: 1px solid #dee2e6;">Precio</th>
          <th style="padding: 10px; border: 1px solid #dee2e6;">Stock</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let prod of productos" style="border-bottom: 1px solid #dee2e6;">
          <td style="padding: 10px; border: 1px solid #dee2e6; color: #666;">{{ prod.id }}</td>
          <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">{{ prod.nombre }}</td>
          <td style="padding: 10px; border: 1px solid #dee2e6; color: #28a745;">\${{ prod.precio }}</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;" [style.color]="prod.stock <= 5 ? 'red' : 'black'">
            {{ prod.stock }} pzas {{ prod.stock <= 5 ? '(Bajo Stock)' : '' }}
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class InventarioComponent {
  @Input() productos: any[] = [];
  @Output() onGuardar = new EventEmitter<any>();

  nuevoProd = { nombre: '', precio: null, stock: null };

  guardar() {
    if (!this.nuevoProd.nombre || this.nuevoProd.precio === null || this.nuevoProd.stock === null) {
      alert('Por favor, llena todos los campos.');
      return;
    }
    this.onGuardar.emit({ ...this.nuevoProd });
    this.nuevoProd = { nombre: '', precio: null, stock: null };
  }
}
