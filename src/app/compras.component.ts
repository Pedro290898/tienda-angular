import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-compras',
  template: `
    <div style="background-color: #fff; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h3 style="color: #007bff; margin-top: 0;">🛒 Módulo de Reabastecimiento (Compras)</h3>
      <p style="color: #666;">Selecciona un producto para registrar la entrada de stock desde tu proveedor.</p>
      
      <!-- Selector de producto existente -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Seleccionar Producto:</label>
        <select [(ngModel)]="productoSeleccionado" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option [ngValue]="null" disabled>-- Elige un producto --</option>
          <option *ngFor="let prod of productos" [ngValue]="prod">{{ prod.nombre }} (Stock actual: {{ prod.stock }})</option>
        </select>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cantidad Comprada:</label>
          <input type="number" [(ngModel)]="cantidad" min="1" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Precio Costo (Proveedor):</label>
          <input type="number" [(ngModel)]="precioCosto" min="0" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
      </div>

      <button (click)="agregarListaCompra()" style="width: 100%; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
        ➕ Añadir a la Lista de Compra
      </button>

      <!-- Tabla temporal de la compra actual -->
      <div *ngIf="carritoCompra.length > 0">
        <h4>📋 Resumen de la Orden de Compra</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
              <th style="padding: 8px; text-align: left;">Producto</th>
              <th style="padding: 8px; text-align: center;">Cantidad</th>
              <th style="padding: 8px; text-align: right;">Costo U.</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of carritoCompra" style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 8px;">{{ item.nombre }}</td>
              <td style="padding: 8px; text-align: center;">{{ item.cantidad }}</td>
              <td style="padding: 8px; text-align: right;">\${{ item.precio_costo }}</td>
              <td style="padding: 8px; text-align: right;">\${{ item.cantidad * item.precio_costo }}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: right; margin-bottom: 15px; font-size: 16px; font-weight: bold;">
          Total Orden: \${{ calcularTotalCompra() }}
        </div>

        <button (click)="enviarCompra()" style="width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 15px;">
          💾 Guardar Compra e Incrementar Inventario
        </button>
      </div>
    </div>
  `
})
export class ComprasComponent {
  @Input() productos: any[] = [];
  @Output() onCompraFinalizada = new EventEmitter<{ carrito: any[], total: number }>();

  productoSeleccionado: any = null;
  cantidad: number = 1;
  precioCosto: number = 0;
  carritoCompra: any[] = [];

  agregarListaCompra() {
    if (!this.productoSeleccionedValid()) return;
    
    this.carritoCompra.push({
      id: this.productoSeleccionado.id,
      nombre: this.productoSeleccionado.nombre,
      stock: this.productoSeleccionado.stock,
      cantidad: this.cantidad,
      precio_costo: this.precioCosto
    });

    // Resetear formulario interno
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioCosto = 0;
  }

  productoSeleccionedValid() {
    return this.productoSeleccionado && this.cantidad > 0 && this.precioCosto >= 0;
  }

  calcularTotalCompra() {
    return this.carritoCompra.reduce((sum, item) => sum + (item.cantidad * item.precio_costo), 0);
  }

  enviarCompra() {
    if (this.carritoCompra.length === 0) return;
    this.onCompraFinalizada.emit({
      carrito: this.carritoCompra,
      total: this.calcularTotalCompra()
    });
    this.carritoCompra = []; // Limpiamos el contenedor tras guardar
  }
}
