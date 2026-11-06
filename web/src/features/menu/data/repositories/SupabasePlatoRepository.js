import { IPlatoRepository } from '../../domain/repositories/IPlatoRepository';
import { PlatoModel } from '../models/PlatoModel';
import { supabase as defaultSupabase } from '../../../../core/config/supabaseClient';
import { AppError } from '../../../../core/errors/AppError';

function extractStoragePath(imageUrlOrPath) {
  if (!imageUrlOrPath || typeof imageUrlOrPath !== 'string') return null;
  const marker = '/imagenes/';
  const idx = imageUrlOrPath.indexOf(marker);
  if (idx !== -1) {
    return decodeURIComponent(imageUrlOrPath.substring(idx + marker.length));
  }
  if (imageUrlOrPath.startsWith('platos/')) {
    return imageUrlOrPath;
  }
  return null;
}

/**
 * Repositorio Concreto: SupabasePlatoRepository
 * 
 * Implementa IPlatoRepository interactuando con la tabla 'plato' y el storage bucket 'imagenes'.
 */
export class SupabasePlatoRepository extends IPlatoRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} client
   */
  constructor(client = defaultSupabase) {
    super();
    this.client = client;
  }

  async uploadPlatoImage(file) {
    if (!file) throw new AppError('No se proporcionó ningún archivo para subir.', 'VALIDATION_ERROR');

    const ext = file.type === 'image/webp' ? 'webp' : (file.name?.split('.').pop() || 'webp');
    const cleanName = `plato_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `platos/${cleanName}`;

    const { error } = await this.client.storage
      .from('imagenes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/webp',
      });

    if (error) {
      throw new AppError(`Error al subir la imagen al bucket: ${error.message}`, 'STORAGE_ERROR', error);
    }

    const { data: urlData } = this.client.storage
      .from('imagenes')
      .getPublicUrl(filePath);

    return { filePath, publicUrl: urlData.publicUrl };
  }

  async deletePlatoImage(imageUrlOrPath) {
    const path = extractStoragePath(imageUrlOrPath);
    if (!path) return;

    const { error } = await this.client.storage
      .from('imagenes')
      .remove([path]);

    if (error) {
      console.warn(`[SupabasePlatoRepository] No se pudo eliminar la imagen previa (${path}):`, error.message);
    }
  }

  async getPlatos() {
    const { data, error } = await this.client
      .from('plato')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw new AppError(error.message, 'FETCH_PLATOS_ERROR', error);
    }

    return (data || []).map((row) => PlatoModel.fromSupabase(row));
  }

  async getPlatoById(id_plato) {
    const { data, error } = await this.client
      .from('plato')
      .select('*')
      .eq('id_plato', id_plato)
      .single();

    if (error) {
      throw new AppError(error.message, 'FETCH_PLATO_ERROR', error);
    }

    return PlatoModel.fromSupabase(data);
  }

  async createPlato(platoData, imageFile = null) {
    let uploadedPath = null;
    const finalData = { ...platoData };

    if (imageFile) {
      const { filePath, publicUrl } = await this.uploadPlatoImage(imageFile);
      uploadedPath = filePath;
      finalData.imagen_url = publicUrl;
    }

    try {
      const { data, error } = await this.client
        .from('plato')
        .insert(finalData)
        .select()
        .single();

      if (error) throw error;
      return PlatoModel.fromSupabase(data);
    } catch (dbError) {
      // Rollback de imagen si la base de datos rechaza la inserción
      if (uploadedPath) {
        await this.deletePlatoImage(uploadedPath).catch(console.error);
      }
      throw new AppError(dbError.message, 'CREATE_PLATO_ERROR', dbError);
    }
  }

  async updatePlato(id_plato, updateData, newImageFile = null, removeCurrentImage = false, currentImageUrl = null) {
    let uploadedPath = null;
    const finalUpdate = { ...updateData };

    if (newImageFile) {
      const { filePath, publicUrl } = await this.uploadPlatoImage(newImageFile);
      uploadedPath = filePath;
      finalUpdate.imagen_url = publicUrl;
    } else if (removeCurrentImage) {
      finalUpdate.imagen_url = null;
    }

    try {
      const { data, error } = await this.client
        .from('plato')
        .update(finalUpdate)
        .eq('id_plato', id_plato)
        .select()
        .single();

      if (error) throw error;

      if ((newImageFile || removeCurrentImage) && currentImageUrl) {
        await this.deletePlatoImage(currentImageUrl).catch(console.error);
      }

      return PlatoModel.fromSupabase(data);
    } catch (dbError) {
      if (uploadedPath) {
        await this.deletePlatoImage(uploadedPath).catch(console.error);
      }
      throw new AppError(dbError.message, 'UPDATE_PLATO_ERROR', dbError);
    }
  }

  async deletePlato(id_plato, currentImageUrl = null) {
    // 1. Eliminar relaciones en la tabla pivote menu_plato
    await this.client
      .from('menu_plato')
      .delete()
      .eq('id_plato', id_plato);

    // 2. Eliminar plato de la base de datos
    const { error } = await this.client
      .from('plato')
      .delete()
      .eq('id_plato', id_plato);

    if (error) {
      throw new AppError(error.message, 'DELETE_PLATO_ERROR', error);
    }

    // 3. Limpiar imagen de storage
    if (currentImageUrl) {
      await this.deletePlatoImage(currentImageUrl).catch(console.error);
    }

    return true;
  }
}
