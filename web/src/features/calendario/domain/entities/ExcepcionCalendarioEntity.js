/**
 * Entidad de Dominio: ExcepcionCalendarioEntity
 * 
 * Regla de Clean Architecture:
 * - Cero dependencias de librerías externas o Supabase.
 * - Modela las reglas e invariantes de un día inhábil / de no atención en el restaurante.
 */
export class ExcepcionCalendarioEntity {
  constructor({
    id_excepcion,
    fecha,
    motivo = '',
    id_encargado = null,
    created_at = null,
    is_activo = true,
  }) {
    this.id_excepcion = id_excepcion;
    // Normalizar fecha en formato YYYY-MM-DD
    this.fecha = fecha ? fecha.split('T')[0] : '';
    this.motivo = (motivo || '').trim();
    this.id_encargado = id_encargado;
    this.created_at = created_at;
    this.is_activo = is_activo !== false;
  }

  // Compatibilidad con identificadores existentes
  get id() {
    return this.id_excepcion;
  }

  isPast() {
    if (!this.fecha) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateParts = this.fecha.split('-').map(Number);
    const itemDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return itemDate < today;
  }

  isToday() {
    if (!this.fecha) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return this.fecha === `${y}-${m}-${d}`;
  }
}
