
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-reportes',
  template: `
    <div style="background-color: #fff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-family: sans-serif;">
      <h3 style="color: #007bff; margin-top: 0; display: flex; align-items: center; gap: 8px;">📊 Tablero de Analíticas y Reportes</h3>
      
      <!-- Selectores de Período -->
      <div style="display: flex; gap: 10px; margin-bottom: 25px;">
        <button *ngFor="let p of periodos" 
                (click)="cambiarPeriodo(p.id)"
                [style.background-color]="periodoActual === p.id ? '#007bff' : '#f8f9fa'"
                [style.color]="periodoActual === p.id ? 'white' : '#333'"
                [style.border]="periodoActual === p.id ? '1px solid #007bff' : '1px solid #ccc'"
                style="flex: 1; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
          {{ p.nombre }}
        </button>
      </div>

      <!-- Tarjetas de Totales -->
      <div style="display: flex; gap: 15px; margin-bottom: 30px;" *ngIf="!cargando; else cargandoTemplate">
        <div style="flex: 1; background-color: #eafaf1; border-left: 5px solid #28a745; padding: 15px; border-radius: 4px;">
          <small style="color: #28a745; font-weight: bold; text-transform: uppercase;">💰 Ventas Totales</small>
          <h2 style="margin: 5px 0 0 0; color: #1e7e34;">\${{ datosReporte.total_ventas | number:'1.2-2' }}</h2>
        </div>

        <div style="flex: 1; background-color: #fdf2f2; border-left: 5px solid #dc3545; padding: 15px; border-radius: 4px;">
          <small style="color: #dc3545; font-weight: bold; text-transform: uppercase;">🛒 Inversión (Compras)</small>
          <h2 style="margin: 5px 0 0 0; color: #bd2130;">\${{ datosReporte.total_compras | number:'1.2-2' }}</h2>
        </div>

        <div [style.background-color]="datosReporte.ganancia_neta >= 0 ? '#e8f4fd' : '#fff3cd'" 
             [style.border-left]="datosReporte.ganancia_neta >= 0 ? '5px solid #007bff' : '5px solid #ffc107'" 
             style="flex: 1; padding: 15px; border-radius: 4px;">
          <small [style.color]="datosReporte.ganancia_neta >= 0 ? '#007bff' : '#856404'" style="font-weight: bold; text-transform: uppercase;">📈 Utilidad / Ganancia Neta</small>
          <h2 style="margin: 5px 0 0 0;" [style.color]="datosReporte.ganancia_neta >= 0 ? '#0062cc' : '#721c24'">\${{ datosReporte.ganancia_neta | number:'1.2-2' }}</h2>
        </div>
      </div>

      <!-- 📋 SECCIÓN NUEVA: LISTADO DE VENTAS DETALLADAS -->
      <div style="margin-top: 25px;" *ngIf="!cargando">
        <h4 style="margin-bottom: 15px; color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">📋 Historial de Ventas del Período</h4>
        
        <div *ngIf="listaVentas.length === 0" style="text-align: center; color: #888; padding: 25px; font-style: italic; background-color: #f8f9fa; border-radius: 4px;">
          No se registraron transacciones de venta en este rango de tiempo.
        </div>

        <div *ngIf="listaVentas.length > 0" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #6c757d; color: white; text-align: left;">
                <th style="padding: 10px; border: 1px solid #dee2e6;">Folio / ID</th>
                <th style="padding: 10px; border: 1px solid #dee2e6;">Fecha y Hora</th>
                <th style="padding: 10px; border: 1px solid #dee2e6;">Artículos Vendidos</th>
                <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Monto Cobrado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of listaVentas" style="border-bottom: 1px solid #dee2e6; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f3f5'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #007bff;">#{{ v.venta_id }}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6; color: #555;">{{ v.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6; color: #333; font-weight: 500;">{{ v.productos_vendidos }}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right; font-weight: bold; color: #28a745;">\${{ v.total_ticket | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #cargandoTemplate>
        <p style="text-align: center; color: #666; font-style: italic; padding: 40px;">Procesando y cruzando reportes de ventas en tiempo real...</p>
      </ng-template>
    </div>
  `
})
export class ReportesComponent implements OnInit, OnChanges {
  @Input() supabase!: SupabaseClient;
  @Input() idTiendaUsuario!: number | null;

  periodoActual: string = 'dia';
  cargando: boolean = false;
  datosReporte = { total_ventas: 0, total_compras: 0, ganancia_neta: 0 };
  listaVentas: any[] = []; // 🌟 Guardará las filas del historial

  periodos = [
    { id: 'dia', nombre: 'Hoy' },
    { id: 'semana', nombre: 'Esta Semana' },
    { id: 'mes', nombre: 'Este Mes' },
    { id: 'anio', nombre: 'Este Año' }
  ];

  //ngOnInit() {
  //  this.cargarTodoElReporte();
  //}

    ngOnInit() {
    this.periodoActual = 'dia'; // 🌟 Forzamos que inicie en el día de hoy
    this.cargarTodoElReporte();
  }


  /*ngOnChanges(changes: SimpleChanges) {
    if (changes['idTiendaUsuario'] && this.idTiendaUsuario) {
      this.cargarTodoElReporte();
    }
  }*/

      ngOnChanges(changes: SimpleChanges) {
    // Si cambia el ID de la tienda y es un valor válido, recalculamos el día de hoy
    if (changes['idTiendaUsuario'] && this.idTiendaUsuario) {
      this.periodoActual = 'dia'; 
      this.cargarTodoElReporte();
    }
  }


  cambiarPeriodo(periodoId: string) {
    this.periodoActual = periodoId;
    this.cargarTodoElReporte();
  }

  async cargarTodoElReporte() {
    if (!this.idTiendaUsuario || !this.supabase) return;
    this.cargando = true;

    try {
      // 1. Ejecutar las tarjetas globales (igual que antes)
      const { data: dataTarjetas } = await this.supabase
        .rpc('obtener_reporte_financiero', { id_tienda: this.idTiendaUsuario, periodo: this.periodoActual });

      if (dataTarjetas && dataTarjetas.length > 0) {
        this.datosReporte = dataTarjetas[0];
      }

      // 2. 🌟 Ejecutar la nueva consulta para traer el listado desglosado
      const { data: dataHistorial, error: errorHistorial } = await this.supabase
        .rpc('obtener_historial_ventas', { id_tienda: this.idTiendaUsuario, periodo: this.periodoActual });

      if (!errorHistorial && dataHistorial) {
        this.listaVentas = dataHistorial;
      }

    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }
}

