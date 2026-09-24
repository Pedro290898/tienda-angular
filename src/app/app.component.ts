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

<!-- NUEVO BOTÓN DE COMPRAS -->
<button (click)="pestanaActual = 'compras'" [style.background-color]="pestanaActual === 'compras' ? '#007bff' : '#6c757d'" style="padding: 10px 15px; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">🛒 Registrar Compra</button>

<button (click)="pestanaActual = 'ventas'" [style.background-color]="pestanaActual === 'ventas' ? '#007bff' : '#6c757d'" style="padding: 10px 15px; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">💰 Punto de Venta</button>

          </div>
        </div>

        <!-- USAMOS LOS COMPONENTES HIJOS PEQUEÑOS -->
        <app-inventario *ngIf="pestanaActual === 'inventario'" [productos]="productos" (onGuardar)="guardarProducto($event)"></app-inventario>

<!-- NUEVA INSTANCIACIÓN -->
<app-compras *ngIf="pestanaActual === 'compras'" [productos]="productos" (onCompraFinalizada)="procesarCompraGlobal($event)"></app-compras>

<app-ventas *ngIf="pestanaActual === 'ventas'" [productos]="productos" [carrito]="carrito" [total]="obtenerTotal()" (onAgregar)="agregarAlCarrito($event)" (onCambiarCant)="cambiarCantidad($event)" (cobrar)="procesarVenta()"></app-ventas>
        
        </div>

      <p style="color: #dc3545; text-align: center; margin-top: 15px; font-weight: bold;" *ngIf="mensajeError">{{ mensajeError }}</p>
      <p style="color: #28a745; text-align: center; margin-top: 15px; font-weight: bold;" *ngIf="mensajeExito">{{ mensajeExito }}</p>
    </div>
  `
})
export class AppComponent implements OnInit {

  // NOTA: Para producción real en Vercel, sustituye estos strings por las variables de entorno
  // Ejemplo: environment.supabaseUrl, environment.supabaseKey
  supabase: SupabaseClient = createClient(
    'https://srvytgtkcasuylosgzej.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTMxNzAsImV4cCI6MjEwNDY2OTE3MH0.2RD6qneBwTq6IH4QixBOTpJLq9of8BEFKcqicEeyGp4'
  );

  user: any = null;
  esRegistro = false;
  pestanaActual = 'inventario';
  nombreTienda = ''; email = ''; password = ''; mensajeError = ''; mensajeExito = '';
  productos: any[] = []; carrito: any[] = [];
  idTiendaUsuario: number | null = null; // Guardamos el ID de la tienda del usuario actual

  async ngOnInit() {
    const { data } = await this.supabase.auth.getSession();
    this.user = data.session?.user || null;
    if (this.user) this.inicializarDatosUsuario();

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      if (this.user) {
        this.inicializarDatosUsuario();
      } else { 
        this.productos = []; 
        this.carrito = []; 
        this.idTiendaUsuario = null;
      }
    });
  }

  // Método auxiliar para limpiar los mensajes de éxito automáticamente
  mostrarMensajeExito(mensaje: string) {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 3500); // Se limpia automáticamente tras 3.5 segundos
  }

  // Obtenemos primero el ID de la tienda para no repetir la consulta repetidamente
  async inicializarDatosUsuario() {
    try {
      const { data: tiendaData, error } = await this.supabase
        .from('tiendas')
        .select('id')
        .eq('user_id', this.user.id)
        .single();
      
      if (!error && tiendaData) {
        this.idTiendaUsuario = tiendaData.id;
      } else {
        this.idTiendaUsuario = 1; // Fallback por defecto si no encuentra registro en la tabla tiendas
      }
      this.cargarProductos();
    } catch (e) {
      this.idTiendaUsuario = 1;
      this.cargarProductos();
    }
  }

  async cargarProductos() {
    // Si estás usando RLS en Supabase no requieres obligatoriamente el .eq(), 
    // pero añadirlo explícitamente en el código blinda tu lógica multitenant.
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', this.idTiendaUsuario)
      .order('id', { ascending: false });

    if (!error) this.productos = data || [];
  }

  async guardarProducto(nuevoProd: any) {
    this.mensajeError = ''; this.mensajeExito = '';
    try {
      const { error } = await this.supabase.from('productos').insert([{ 
        nombre: nuevoProd.nombre, 
        precio: nuevoProd.precio, 
        stock: nuevoProd.stock, 
        tienda_id: this.idTiendaUsuario
      }]);

      if (error) {
        this.mensajeError = error.message;
      } else { 
        this.mostrarMensajeExito('¡Producto agregado!'); 
        this.cargarProductos(); 
      }
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
    if (this.carrito.length === 0) return; // Validación extra de seguridad

    try {
      const { data: ventaGuardada, error: ventaError } = await this.supabase
        .from('ventas')
        .insert([{ tienda_id: this.idTiendaUsuario, total: this.obtenerTotal() }])
        .select()
        .single();

      if (ventaError) { this.mensajeError = ventaError.message; return; }

      for (const item of this.carrito) {
        await this.supabase.from('detalle_ventas').insert([{
          venta_id: ventaGuardada.id, producto_id: item.id, cantidad: item.cantidad, precio_unitario: item.precio
        }]);
        await this.supabase.from('productos').update({ stock: item.stock - item.cantidad }).eq('id', item.id);
      }

      this.mostrarMensajeExito('¡Venta cobrada con éxito!');
      this.carrito = [];
      this.cargarProductos();
    } catch (e: any) { this.mensajeError = e.message; }
  }

  async ejecutarAccion() {
    this.mensajeError = '';
    try {
      if (this.esRegistro) {
        // REGISTRO DE USUARIO NUEVO
        const { data, error } = await this.supabase.auth.signUp({ email: this.email, password: this.password });
        if (error) { this.mensajeError = error.message; return; }
        
        if (data?.user) {
          // Si el usuario se crea con éxito, creamos su registro de Tienda correspondiente
          await this.supabase.from('tiendas').insert([{
            nombre: this.nombreTienda || 'Mi Tienda Modular',
            user_id: data.user.id
          }]);
          this.mostrarMensajeExito('¡Cuenta y tienda creadas con éxito!');
        }
      } else {
        // INICIO DE SESIÓN
        const { error } = await this.supabase.auth.signInWithPassword({ email: this.email, password: this.password });
        if (error) this.mensajeError = error.message;
      }
    } catch (e: any) {
      this.mensajeError = e.message;
    }
  }

  async cerrarSesion() {
    await this.supabase.auth.signOut();
  }
}

  // 👇 AQUÍ COLOCAS TU NUEVA FUNCIÓN LOGICA DE COMPRAS
  async procesarCompraGlobal(eventoCompra: { carrito: any[], total: number }) {
    this.mensajeError = ''; this.mensajeExito = '';
    if (eventoCompra.carrito.length === 0) return;

    try {
      const { data: compraGuardada, error: compraError } = await this.supabase
        .from('compras')
        .insert([{ tienda_id: this.idTiendaUsuario, total: eventoCompra.total }])
        .select()
        .single();

      if (compraError) { this.mensajeError = compraError.message; return; }

      for (const item of eventoCompra.carrito) {
        await this.supabase.from('detalle_compras').insert([{
          compra_id: compraGuardada.id,
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_costo: item.precio_costo
        }]);

        await this.supabase
          .from('productos')
          .update({ stock: item.stock + item.cantidad })
          .eq('id', item.id);
      }

      this.mostrarMensajeExito('¡Compra registrada e inventario actualizado con éxito!');
      this.cargarProductos();
    } catch (e: any) { 
      this.mensajeError = e.message; 
    }
  }


// publico

//privado