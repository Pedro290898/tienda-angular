import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ventas',
  template: `
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <!-- SELECCIONAR PRODUCTOS -->
      <div style="flex: 1; min-width: 300px; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px;">
        <h3 style="margin-top:0;">🛒 Selecciona Productos</h3>
        <p style="font-size:12px; color:#666;">Haz clic en un producto para añadirlo a la nota de venta:</p>

                <!-- 🔍 BARRA DE BÚSQUEDA EN TIEMPO REAL -->
        <div style="margin-bottom: 15px;">
          <input type="text" 
                 [(ngModel)]="terminoBusqueda" 
                 placeholder="🔍 Buscar producto por nombre..." 
                 style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
        </div>

        <div style="max-height: 400px; overflow-y: auto;">
          <div *<div *ngFor="let prod of productosFiltrados" (click)="agregar(prod)" style="padding: 10px; border: 1px solid #eee; margin-bottom: 8px; border-radius: 4px; cursor: pointer; background-color: #fff;">
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
              <span>{{ prod.nombre }}</span>
              <span style="color:#28a745;">\${{ prod.precio }}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#666; margin-top:4px;">
              <span>Stock: {{ prod.stock }} pzas</span>
              <span *ngIf="prod.stock <= 0" style="color:red; font-weight:bold;">¡Agotado!</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TICKET -->
      <div style="flex: 1; min-width: 300px; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; background-color: #f8f9fa;">
        <h3 style="margin-top:0; border-bottom: 2px dashed #ccc; padding-bottom: 10px;">📄 Nota de Venta</h3>
        <div style="min-height: 150px; margin-bottom: 20px;">
          <div *ngFor="let item of carrito; let i = index" style="display:flex; justify-content:space-between; align-items:center; font-size:14px; margin-bottom:10px;">
            <div style="flex:2;">
              <strong>{{ item.nombre }}</strong> <br>
              <small style="color:#666;">\${{ item.precio }} c/u</small>
            </div>
            <div style="flex:1; text-align:center;">
              <button (click)="cambiarCant(i, -1)">-</button>
              <span style="margin: 0 8px; font-weight:bold;">{{ item.cantidad }}</span>
              <button (click)="cambiarCant(i, 1)">+</button>
            </div>
            <div style="flex:1; text-align:right; font-weight:bold; color:#28a745;">
              \${{ item.precio * item.cantidad }}
            </div>
          </div>
          <div *ngIf="carrito.length === 0" style="text-align:center; color:#999;">El carrito está vacío.</div>
        </div>

        <div style="border-top: 2px dashed #ccc; padding-top: 15px; margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold;">
            <span>TOTAL:</span>
            <span style="color:#28a745;">\${{ total }}</span>
          </div>
        </div>

        <button (click)="cobrar.emit()" [disabled]="carrito.length === 0" style="width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; font-weight: bold;">
          💰 Registrar Venta y Cobrar
        </button>
      </div>
    </div>
  `
})
export class VentasComponent {
  @Input() productos: any[] = [];
  @Input() carrito: any[] = [];
  @Input() total: number = 0;

    terminoBusqueda: string = '';

  get productosFiltrados() {
    if (!this.terminoBusqueda.trim()) {
      return this.productos;
    }
    return this.productos.filter(prod => 
      prod.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  @Output() onAgregar = new EventEmitter<any>();
  @Output() onCambiarCant = new EventEmitter<any>();
  @Output() cobrar = new EventEmitter<void>();

  agregar(prod: any) { this.onAgregar.emit(prod); }
  cambiarCant(index: number, cambio: number) { this.onCambiarCant.emit({ index, cambio }); }
}
