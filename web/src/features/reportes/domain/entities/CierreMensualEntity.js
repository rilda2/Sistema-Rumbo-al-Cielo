/**
 * Entidad de Dominio: CierreMensualEntity
 * Representa la cabecera del cierre contable mensual del restaurante.
 * 
 * Regla de Clean Architecture: Cero dependencias de infraestructura/React/Supabase.
 */
export class CierreMensualEntity {
  constructor({
    id_cierre = null,
    mes,
    year,
    fecha_generacion = new Date().toISOString().split('T')[0],
    total_general = 0,
    cerrado = false,
    created_at = null,
  }) {
    this.id_cierre = id_cierre;
    this.mes = Number(mes);
    this.year = Number(year);
    this.fecha_generacion = fecha_generacion;
    this.total_general = Number(total_general) || 0;
    this.cerrado = Boolean(cerrado);
    this.created_at = created_at;
  }

  isValido() {
    return this.mes >= 1 && this.mes <= 12 && this.year >= 2020;
  }
}
