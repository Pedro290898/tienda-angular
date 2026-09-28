import { Component, Input } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-soporte',
  template: `
    <div style="background-color: #fff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
      <h3 style="color: #007bff; margin-top: 0; display: flex; align-items: center; gap: 8px;">💬 Buzón de Sugerencias y Personalizaciones</h3>
      <p style="color: #666; font-size: 14px;">¿Necesitas alguna función a la medida o un diseño exclusivo para tu tienda? Escríbenos aquí abajo y nos pondremos en contacto contigo por correo para ayudarte.</p>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">Describe tu solicitud detalladamente:</label>
        <textarea [(ngModel)]="txtMensaje" 
                  placeholder="Ej: Hola, me gustaría poder conectar una báscula digital o requiero que el ticket muestre mi logotipo..." 
                  rows="5" 
                  style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-family: sans-serif; resize: vertical; font-size: 14px;"></textarea>
      </div>

      <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" [(ngModel)]="esPersonalizacion" id="chkPerso" style="cursor: pointer;">
        <label for="chkPerso" style="cursor: pointer; font-size: 13px; font-weight: bold; color: #555;">Marcar como solicitud de personalización a la medida</label>
      </div>

      <button (click)="enviarComentario()" 
              [disabled]="!txtMensaje.trim() || enviando"
              style="width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; transition: background-color 0.2s;">
        {{ enviando ? '🚀 Enviando a soporte...' : '📩 Enviar Mensaje Directo' }}
      </button>

      <p style="color: #28a745; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;" *ngIf="msgExito">{{ msgExito }}</p>
      <p style="color: #dc3545; text-align: center; margin-top: 15px; font-weight: bold; font-size: 14px;" *ngIf="msgError">{{ msgError }}</p>
    </div>
  `
})
export class SoporteComponent {
  @Input() supabase!: SupabaseClient;
  @Input() user: any; // Recibimos el objeto completo del usuario autenticado

  txtMensaje: string = '';
  esPersonalizacion: boolean = false;
  enviando: boolean = false;
  msgExito: string = '';
  msgError: string = '';

  async enviarComentario() {
    if (!this.txtMensaje.trim() || !this.supabase || !this.user) return;
    this.enviando = true;
    this.msgExito = '';
    this.msgError = '';

    try {
      const { error } = await this.supabase
        .from('sugerencias')
        .insert([{
          user_id: this.user.id,
          email: this.user.email,
          mensaje: this.txtMensaje,
          solicitud_personalizacion: this.esPersonalizacion
        }]);

      if (error) {
        this.msgError = 'Hubo un inconveniente al enviar: ' + error.message;
      } else {
        this.msgExito = '¡Tu mensaje ha sido enviado con éxito! Revisaremos tu caso de inmediato.';
        this.txtMensaje = ''; // Limpiamos la caja de texto
        this.esPersonalizacion = false;
        
        // Autoocultar el mensaje de éxito tras 4 segundos
        setTimeout(() => this.msgExito = '', 4000);
      }
    } catch (e: any) {
      this.msgError = e.message;
    } finally {
      this.enviando = false;
    }
  }
}
