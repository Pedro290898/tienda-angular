import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family: sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      
      <div *ngIf="!user">
        <h2>{{ esRegistro ? 'Registrar Tienda' : 'Iniciar Sesión' }}</h2>
        
        <div style="margin-bottom: 10px;" *ngIf="esRegistro">
          <label>Nombre de tu Tienda:</label>
          <input type="text" [(ngModel)]="nombreTienda" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>

        <div style="margin-bottom: 10px;">
          <label>Correo Electrónico:</label>
          <input type="email" [(ngModel)]="email" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>

        <div style="margin-bottom: 15px;">
          <label>Contraseña:</label>
          <input type="password" [(ngModel)]="password" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>

        <button (click)="ejecutarAccion()" style="width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{ esRegistro ? 'Crear Cuenta y Tienda' : 'Entrar' }}
        </button>

        <p style="text-align: center; margin-top: 15px; font-size: 14px;">
          <a href="#" (click)="$event.preventDefault(); esRegistro = !esRegistro">
            {{ esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí' }}
          </a>
        </p>
      </div>

      <div *ngIf="user">
        <h2>¡Bienvenido a tu Tienda!</h2>
        <p><strong>Usuario:</strong> {{ user.email }}</p>
        <p style="color: green;">Sesión iniciada con éxito.</p>
        
        <button (click)="cerrarSesion()" style="width: 100%; padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
          Cerrar Sesión
        </button>
      </div>

      <p style="color: red; text-align: center; margin-top: 10px;" *ngIf="mensajeError">{{ mensajeError }}</p>

    </div>
  `,
})
export class AppComponent implements OnInit {


    supabase = createClient(
    'https://supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydnl0Z3RrY2FzdXlsb3NnemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyMjMzNDMsImV4cCI6MjAyNjgxOTM0M30.2RDBqne...' 
  );


  user: any = null;
  esRegistro = false;
  nombreTienda = '';
  email = '';
  password = '';
  mensajeError = '';

  async ngOnInit() {
    const { data } = await this.supabase.auth.getSession();
    this.user = data.session?.user || null;

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
