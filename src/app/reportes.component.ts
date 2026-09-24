import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-reportes',
  template: `
    <div style="background-color: #fff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
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
      <div style="display: flex; gap: 15px; margin-bottom: 20px;" *ngIf="!cargando; else cargandoTemplate">
        <div style="flex: 1; background-color: #eafaf1; border-left: 5px solid #28a745; padding: 15px; border-radius: 4px;">
          <small style="color: #28a745; font-weight: bold; text-transform: uppercase;">💰 Ventas Totales</small>
          <h2 style="margin: 5px 0 0 0; color: #1e7e34;">\${{ datosReporte.total_ventas | number:'1.2-2' }}</h2>
        </div>

        <div style="flex: 1; background-color: #fdf2f2; border-left: 5px solid #dc3545; padding: 15px; border-radius: 4px;">
          <small style="color: #dc3545; font-weight: bold; text-transform: uppercase;">🛒 Inversión (Compras)</small>
          <h2 style="margin: 5px 0 0 0; color: #bd2130;">\${{ datosReporte.total_compras | number:'1.2-2' }}</h2>
        </div>

        <div style="flex: 1; [style.background-color]="datosReporte.ganancia_neta >= 0 ? '#e8f4fd' : '#fff3cd'" [style.border-left]="datosReporte.ganancia_neta >= 0 ? '5px solid #007bff' : '5px solid #ffc107'" padding: 15px; border-radius: 4px;">
          <small [style.color]="datosReporte.ganancia_neta >= 0 ? '#007bff' : '#856404'" style="font-weight: bold; text-transform: uppercase;">📈 Utilidad / Ganancia Neta</small>
          <h2 style="margin: 5px 0 0 0;" [style.color]="datosReporte.ganancia_neta >= 0 ? '#0062cc' : '#721c24'">\${{ datosReporte.ganancia_neta | number:'1.2-2' }}</h2>
        </div>
      </div>

      <ng-template #cargandoTemplate>
        <p style="text-align: center; color: #666; font-style: italic; padding: 20px;">Calculando métricas en tiempo real...</p>
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

  periodos = [
    { id: 'dia', nombre: 'Hoy' },
    { id: 'semana', nombre: 'Esta Semana' },
    { id: 'mes', nombre: 'Este Mes' },
    { id: 'anio', nombre: 'Este Año' }
  ];

  ngOnInit() {
    this.consultarMetricas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idTiendaUsuario'] && this.idTiendaUsuario) {
      this.consultarMetricas();
    }
  }

  cambiarPeriodo(periodoId: string) {
    this.periodoActual = periodoId;
    this.consultarMetricas();
  }

  async consultarMetricas() {
    if (!this.idTiendaUsuario || !this.supabase) return;
    this.cargando = true;

    try {
      const { data, error } = await this.supabase
        .rpc('obtener_reporte_financiero', { 
          id_tienda: this.idTiendaUsuario, 
          periodo: this.periodoActual 
        });

      if (!error && data && data.length > 0) {
        this.datosReporte = data[0];
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }
}
