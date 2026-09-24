import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; max-width: 1000px; margin: 30px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <!-- LOGIN -->
      <div *ngIf="!user">
        <h2>{{ esRegistro ? 'Registrar Tienda' : 'Iniciar Sesión' }}</h2>
        <div style="margin-bottom: 10px;" *ngIf="esRegistro">
          <label style="display: block; margin-bottom: 5px;">Nombre de tu Tienda:</label>
          <input type="text" [(ngModel)]="nombreTienda" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px;">Correo:</label>
          <input type="email" [(ngModel)]="email" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Contraseña:</label>
          <input type="password" [(ngModel)]="password" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <button (click)="ejecutarAccion()" style="width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">{{ esRegistro ? 'Crear Cuenta' : 'Entrar' }}</button>
        <p style="text-align: center; margin-top: 15px;"><a href="#" (click)="$event.preventDefault(); esRegistro = !esRegistro">{{ esRegistro ? 'Inicia sesión' : 'Regístrate aquí' }}</a></p>
      </div>

      <!-- PANTALLA PRINCIPAL DEL SISTEMA -->
      <div *ngIf="user">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; color: #007bff;">🏪 Sistema POS Modular</h2>
            <small style="color: #666;">Usuario: {{ user.email }}</small>
          </div>
          <div>
            <button (click)="pestanaActual = 'inventario'" [style.background-color]="pestanaActual === 'inventario' ? '#007bff' : '#6c757d'" style="padding: 10px 15px; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">📦 Inventario</button>
            <button (click)="pestanaActual = 'ventas'" [style.background-color]="pestanaActual === 'ventas' ? '#007bff' : '#6c757d'" style="padding: 10px 15px; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">💰 Punto de Venta</button>
            <button (click)="cerrarSesion()" style="padding: 10px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 15px;">Salir</button>
          </div>
        </div>

        <!-- USAMOS LOS COMPONENTES HIJOS PEQUEÑOS -->
        <app-inventario *ngIf="pestanaActual === 'inventario'" [productos]="productos" (onGuardar)="guardarProducto($event)"></app-inventario>
        <app-ventas *ngIf="pestanaActual === 'ventas'" [productos]="productos" [carrito]="carrito" [total]="obtenerTotal()" (onAgregar)="agregarAlCarrito($event)" (onCambiarCant)="cambiarCantidad($event)" (cobrar)="procesarVenta()"></app-ventas>
      </div>

      <p style="color: #dc3545; text-align: center; margin-top: 15px; font-weight: bold;" *ngIf="mensajeError">{{ mensajeError }}</p>
      <p style="color: #28a745; text-align: center; margin-top: 15px; font-weight: bold;" *ngIf="mensajeExito">{{ mensajeExito }}</p>
    </div>
  `
})
export class AppComponent implements OnInit {

   supabase = createClient(
    'https://srvytgtkcasuylosgzej.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTMxNzAsImV4cCI6MjEwNDY2OTE3MH0.2RD6qneBwTq6IH4QixBOTpJLq9of8BEFKcqicEeyGp4'
  );

  /*supabase: SupabaseClient = createClient(
    'https:/srvytgtkcasuylosgzej/supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTMxNzAsImV4cCI6MjEwNDY2OTE3MH0.2RD6qneBwTq6IH4QixBOTpJLq9of8BEFKcqicEeyGp4' // <-- REVISA TU CLAVE DE SUPABASE
  );*/

  user: any = null;
  esRegistro = false;
  pestanaActual = 'inventario';
  nombreTienda = ''; email = ''; password = ''; mensajeError = ''; mensajeExito = '';
  productos: any[] = []; carrito: any[] = [];

  async ngOnInit() {
    const { data } = await this.supabase.auth.getSession();
    this.user = data.session?.user || null;
    if (this.user) this.cargarProductos();

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      if (this.user) this.cargarProductos();
      else { this.productos = []; this.carrito = []; }
    });
  }

  async cargarProductos() {
    const { data, error } = await this.supabase.from('productos').select('*').order('id', { ascending: false });
    if (!error) this.productos = data || [];
  }

  async guardarProducto(nuevoProd: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    try {
      let idFinalTienda = 1;
      const { data: tiendaData } = await this.supabase.from('tiendas').select('id').eq('user_id', this.user.id).single();
      if (tiendaData) idFinalTienda = tiendaData.id;

      const { error } = await this.supabase.from('productos').insert([{ 
        nombre: nuevoProd.nombre, precio: nuevoProd.precio, stock: nuevoProd.stock, tienda_id: idFinalTienda
      }]);

      if (error) this.mensajeError = error.message;
      else { this.mensajeExito = '¡Producto agregado!'; this.cargarProductos(); }
    } catch (e: any) { this.mensajeError = e.message; }
  }

  agregarAlCarrito(producto: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    if (producto.stock <= 0) { this.mensajeError = '¡No hay stock!'; return; }
    const existente = this.carrito.find(item => item.id === producto.id);
    if (existente) {
      if (existente.cantidad >= producto.stock) { this.mensajeError = 'Límite de stock alcanzado.'; return; }
      existente.cantidad++;
    } else { this.carrito.push({ ...producto, cantidad: 1 }); }
  }

  cambiarCantidad(evento: any) {
    const item = this.carrito[evento.index];
    const prodOriginal = this.productos.find(p => p.id === item.id);
    item.cantidad += evento.cambio;
    if (item.cantidad > prodOriginal.stock) item.cantidad = prodOriginal.stock;
    if (item.cantidad <= 0) this.carrito.splice(evento.index, 1);
  }

  obtenerTotal() { return this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0); }

  async procesarVenta() {
    this.mensajeError = ''; this.mensajeExito = '';
    try {
      let idFinalTienda = 1;
      const { data: tiendaData } = await this.supabase.from('tiendas').select('id').eq('user_id', this.user.id).single();
      if (tiendaData) idFinalTienda = tiendaData.id;

      const { data: ventaGuardada, error: ventaError } = await this.supabase
        .from('ventas').insert([{ tienda_id: idFinalTienda, total: this.obtenerTotal() }]).select().single();

      if (ventaError) { this.mensajeError = ventaError.message; return; }

      for (const item of this.carrito) {
        await this.supabase.from('detalle_ventas').insert([{
          venta_id: ventaGuardada.id, producto_id: item.id, cantidad: item.cantidad, precio_unitario: item.precio
        }]);
        await this.supabase.from('productos').update({ stock: item.stock - item.cantidad }).eq('id', item.id);
      }

      this.mensajeExito = '¡Venta cobrada con éxito!';
      this.carrito = [];
      this.cargarProductos();
    } catch (e: any) { this.mensajeError = e.message; }
  }

  async ejecutarAccion() {
    this.mensajeError = '';
    if (this.esRegistro) {
      const { data, error } = await this.supabase.auth.signUp({ email: this.email, password: this.password });
      if (error) { this.mensajeError = error.message; return; }
      if (data.user) await this.supabase.from('tiendas').insert([{ nombre: this.nombreTienda, user_id: data.user.id }]);
    } else {
      const { error } = await this.supabase.auth.signInWithPassword({ email: this.email, password: this.password });
      if (error) this.mensajeError = error.message;
    }
  }

  async cerrarSesion() { await this.supabase.auth.signOut(); this.user = null; }
}
