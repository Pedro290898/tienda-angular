import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; max-width: 800px; margin: 30px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <!-- 1. PANTALLA DE LOGIN (SI NO HAY USUARIO) -->
      <div *ngIf="!user">
        <h2>{{ esRegistro ? 'Registrar Tienda' : 'Iniciar Sesión' }}</h2>
        
        <div style="margin-bottom: 10px;" *ngIf="esRegistro">
          <label style="display: block; margin-bottom: 5px;">Nombre de tu Tienda:</label>
          <input type="text" [(ngModel)]="nombreTienda" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px;">Correo Electrónico:</label>
          <input type="email" [(ngModel)]="email" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Contraseña:</label>
          <input type="password" [(ngModel)]="password" style="width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;">
        </div>

        <button (click)="ejecutarAccion()" style="width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
          {{ esRegistro ? 'Crear Cuenta y Tienda' : 'Entrar' }}
        </button>

        <p style="text-align: center; margin-top: 15px; font-size: 14px;">
          <a href="#" (click)="$event.preventDefault(); esRegistro = !esRegistro" style="color: #007bff; text-decoration: none;">
            {{ esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí' }}
          </a>
        </p>
      </div>

      <!-- 2. PANTALLA PRINCIPAL DEL SISTEMA (USUARIO LOGUEADO) -->
      <div *ngIf="user">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0; color: #007bff;">🏪 Sistema de Inventario</h2>
            <small style="color: #666;">Usuario: {{ user.email }}</small>
          </div>
          <button (click)="cerrarSesion()" style="padding: 8px 15px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cerrar Sesión
          </button>
        </div>

        <!-- FORMULARIO PARA AGREGAR NUEVO PRODUCTO -->
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
              <button (click)="guardarProducto()" style="width:100%; padding:10px; background-color: #28a745; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                ＋ Guardar
              </button>
            </div>

          </div>
        </div>

        <!-- TABLA DE LISTADO DE PRODUCTOS -->
        <h3>📋 Lista de Existencias</h3>
        <div style="overflow-x: auto;">
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
              <tr *ngIf="productos.length === 0">
                <td colspan="4" style="text-align: center; padding: 20px; color: #999;">No hay productos registrados en tu inventario aún.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MENSAJES DE ERROR O NOTIFICACIONES -->
      <p style="color: #dc3545; text-align: center; margin-top: 15px; font-weight: bold;" *ngIf="mensajeError">{{ mensajeError }}</p>

    </div>
  `,
})
export class AppComponent implements OnInit {
  // Conexión real a tu base de datos
  supabase: SupabaseClient = createClient(
    'https://supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyMjMzNDMsImV4cCI6MjAyNjgxOTM0M30.2RDBqneYitXbIOnuA1bcljE2Z8XoU7YitXbIOnuA1bcljE2Z8XoU7Y' // <-- REVISA QUE ESTA SEA TU CLAVE COMPLETA DE SUPABASE
  );

  user: any = null;
  esRegistro = false;
  
  // Variables de Autenticación
  nombreTienda = '';
  email = '';
  password = '';
  mensajeError = '';

  // Variables de Inventario
  productos: any[] = [];
  nuevoProd = {
    nombre: '',
    precio: null,
    stock: null
  };

  async ngOnInit() {
    // 1. Verificar sesión activa al cargar
    const { data } = await this.supabase.auth.getSession();
    this.user = data.session?.user || null;

    if (this.user) {
      this.cargarProductos();
    }

    // 2. Escuchar cambios de sesión en vivo
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      if (this.user) {
        this.cargarProductos();
      } else {
        this.productos = [];
      }
    });
  }

  // FUNCIÓN PARA CARGAR LOS PRODUCTOS DESDE SUPABASE
  async cargarProductos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      this.mensajeError = 'Error al cargar productos: ' + error.message;
    } else {
      this.productos = data || [];
    }
  }

  // FUNCIÓN PARA GUARDAR UN NUEVO PRODUCTO EN LA BASE DE DATOS
  async guardarProducto() {
    this.mensajeError = '';
    
    if (!this.nuevoProd.nombre || this.nuevoProd.precio === null || this.nuevoProd.stock === null) {
      this.mensajeError = 'Por favor, llena todos los campos del producto.';
      return;
    }

    const { data, error } = await this.supabase
      .from('productos')
      .insert([
        { 
          nombre: this.nuevoProd.nombre, 
          precio: this.nuevoProd.precio, 
          stock: this.nuevoProd.stock 
        }
      ])
      .select();

    if (error) {
      this.mensajeError = 'Error al guardar producto: ' + error.message;
    } else {
      // Limpiar el formulario y recargar la lista
      this.nuevoProd = { nombre: '', precio: null, stock: null };
      this.cargarProductos();
    }
  }

  // ACCIONES DE LOGIN / REGISTRO
  async ejecutarAccion() {
    this.mensajeError = '';
    
    if (this.esRegistro) {
      if (!this.nombreTienda) {
        this.mensajeError = 'Por favor, escribe el nombre de tu tienda.';
        return;
      }
      
      const { data, error } = await this.supabase.auth.signUp({
        email: this.email,
        password: this.password,
      });

      if (error) { this.mensajeError = error.message; return; }

      if (data.user) {
        await this.supabase.from('tiendas').insert([
          { nombre: this.nombreTienda, user_id: data.user.id }
        ]);
      }

    } else {
      const { error } = await this.supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) this.mensajeError = error.message;
    }
  }

  async cerrarSesion() {
    await this.supabase.auth.signOut();
    this.user = null;
  }
}
