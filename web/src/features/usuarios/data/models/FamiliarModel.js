import { FamiliarEntity } from '../../domain/entities/FamiliarEntity';

/**
 * Modelo de Datos: FamiliarModel
 * 
 * Mapea la información combinada de familiar y persona a FamiliarEntity.
 */
export class FamiliarModel {
  static fromSupabase(row) {
    if (!row) return null;

    const persona = row.persona || {};

    return new FamiliarEntity({
      id_persona: row.id_persona || persona.id_persona,
      id_usuario: row.id_usuario,
      parentesco: row.parentesco,
      nombre: persona.nombre || row.nombre || '',
      apellidos: persona.apellidos || row.apellidos || '',
      telefono: persona.telefono || row.telefono || '',
    });
  }
}
