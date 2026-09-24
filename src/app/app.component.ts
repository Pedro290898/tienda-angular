import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  template: `
    <div style="font-family: sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      
      <!-- PANTALLA SI EL USUARIO NO ESTÁ LOGUEADO -->
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

      <!-- PANTALLA SI EL USUARIO YA INICIÓ SESIÓN -->
      <div *ngIf="user">
        <h2 style="color: #28a745;">¡Bienvenido a tu Tienda!</h2>
        <p><strong>Usuario activo:</strong> {{ user.email }}</p>
        <p style="font-size: 14px; color: #555; background-color: #e2f0d9; padding: 10px; border-radius: 4px;">
          Tu base de datos relacional multi-usuario en Supabase está conectada. Ya puedes gestionar tus productos de forma privada.
        </p>
        
        <button (click)="cerrarSesion()" style="width: 100%; padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; font-size: 16px;">
          Cerrar Sesión
        </button>
      </div>

      <!-- MENSAJES DE ERROR -->
      <p style="color: #dc3545; text-align: center; margin-top: 10px; font-weight: bold;" *ngIf="mensajeError">{{ mensajeError }}</p>

    </div>
  `,
})
export class AppComponent implements OnInit {
  // ⚠️ COLOCA TU URL Y TU CLAVE LEGACY ANON CORRECTAS DE SUPABASE
    supabase = createClient(
    'https://srvytgtkcasuylosgzej.supabase.co',
    'srvytgtkcasuylosgzej'
  );

  //supabase: SupabaseClient = createClient(
   // 'https://srvytgtkcasuylosgzej',
   // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTMxNzAsImV4cCI6MjEwNDY2OTE3MH0.2RD6qneBwTq6IH4QixBOTpJLq9of8BEFKcqicEeyGp4'
  //);

  user: any = null;
  esRegistro = false;
  
  // Variables del Formulario
  nombreTienda = '';
  email = '';
  password = '';
  mensajeError = '';

  async ngOnInit() {
    // Revisar si ya hay una sesión de usuario guardada al abrir la página
    const { data } = await this.supabase.auth.getSession();
    this.user = data.session?.user || null;

    // Escuchar en tiempo real si el usuario inicia o cierra sesión
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
    });
  }

  async ejecutarAccion() {
    this.mensajeError = '';
    
    if (this.esRegistro) {
      if (!this.nombreTienda) {
        this.mensajeError = 'Por favor, escribe el nombre de tu tienda.';
        return;
      }
      
      // 1. Crear el usuario en la sección de Autenticación de Supabase
      const { data, error } = await this.supabase.auth.signUp({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.mensajeError = error.message;
        return;
      }

      // 2. Insertar la tienda asociada al ID único del nuevo usuario
      if (data.user) {
        const { error: tiendaError } = await this.supabase.from('tiendas').insert([
          { nombre: this.nombreTienda, user_id: data.user.id }
        ]);

        if (tiendaError) {
          this.mensajeError = 'Cuenta creada, pero error al registrar tienda: ' + tiendaError.message;
        }
      }

    } else {
      // Login tradicional con correo y contraseña
      const { error } = await this.supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.mensajeError = error.message;
      }
    }
  }

  async cerrarSesion() {
    await this.supabase.auth.signOut();
    this.user = null;
    this.nombreTienda = '';
    this.email = '';
    this.password = '';
  }
}
