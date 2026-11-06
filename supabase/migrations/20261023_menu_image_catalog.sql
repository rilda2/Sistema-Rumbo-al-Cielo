-- Catálogo visual del menú diario.
-- Las rutas son relativas al bucket público de imágenes del menú.
-- Subir primero estos archivos a Supabase Storage si aún no existen.

INSERT INTO public.platos_catalogo
  (nombre, descripcion, categoria, region, precio, imagen_url)
VALUES
  ('Pique Macho Especial',
   'Segundo especial de lomo, salchicha, papa, huevo, cebolla, tomate y locoto.',
   'Especial', 'Cochabamba', 24.00, 'assets/images/02_pique_macho.jpg'),
  ('Trucha del Titicaca al Limón',
   'Segundo especial de trucha a la plancha con arroz y papas doradas.',
   'Especial', 'La Paz', 24.00, 'assets/images/11_tortilla_de_verduras.jpg'),
  ('Quinua Real con Champiñones y Palta',
   'Opción vegetariana de quinua, champiñones, verduras y palta.',
   'Vegetariano', 'Potosí / Oruro', 16.00,
   'assets/images/08_crema_de_quinua.jpg'),
  ('Milanesa de Soya con Ensalada Criolla',
   'Opción vegetariana de milanesa de soya, arroz, papa y ensalada.',
   'Vegetariano', 'Nacional', 16.00,
   'assets/images/07_milanesa_de_soya.jpg')
ON CONFLICT (nombre) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  categoria = EXCLUDED.categoria,
  region = EXCLUDED.region,
  precio = EXCLUDED.precio,
  imagen_url = EXCLUDED.imagen_url;

-- Imágenes que todavía deben producirse y subirse para completar el menú:
-- assets/images/ensalada_fresca_del_dia.jpg
-- assets/images/ensalada_rusa.jpg
