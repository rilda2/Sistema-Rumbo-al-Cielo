/**
 * Arma el combo de la reserva a partir de los platos publicados de un día.
 * Reglas (de la APK):
 *  - Almuerzo Completo = Entrada + Sopa + Segundo (las partes que existan).
 *  - Si el plato principal es vegetariano o especial, cambia la categoría.
 *
 * @param {Array} platos     platos del menú del día ({ id_plato, nombre, categoria })
 * @param {number|null} idPlatoPrincipal  si el día tiene varios segundos, el elegido
 */
const norm = (s) => String(s || '').trim().toLowerCase();

const PRINCIPALES = ['segundo', 'plato fuerte', 'vegetariano', 'especial'];

export function armarCombo(platos = [], idPlatoPrincipal = null) {
    const lista = Array.isArray(platos) ? platos : [];

    const sopa = lista.find((p) => norm(p.categoria) === 'sopa') || null;
    const entrada = lista.find((p) => norm(p.categoria) === 'entrada') || null;
    const principales = lista.filter((p) => PRINCIPALES.includes(norm(p.categoria)));

    let principal = null;
    if (idPlatoPrincipal !== null && idPlatoPrincipal !== undefined) {
        principal = lista.find((p) => Number(p.id_plato) === Number(idPlatoPrincipal)) || null;
    }
    if (!principal) principal = principales[0] || null;
    if (!principal) {
        principal =
            lista.find((p) => !['sopa', 'entrada', 'postre', 'bebida'].includes(norm(p.categoria))) ||
            lista[0] ||
            null;
    }

    let categoriaMenu = 'almuerzo_completo';
    if (principal && norm(principal.categoria) === 'vegetariano') categoriaMenu = 'menu_vegetariano';
    if (principal && norm(principal.categoria) === 'especial') categoriaMenu = 'plato_especial';

    const esAlmuerzoCompleto = categoriaMenu === 'almuerzo_completo';
    const partes = [entrada?.nombre, sopa?.nombre, principal?.nombre].filter(Boolean);

    const dishName = esAlmuerzoCompleto
        ? `Almuerzo Completo (${partes.join(' + ')})`
        : principal?.nombre || 'Plato del día';

    return {
        dishName,
        platoPrincipal: principal?.nombre || null,
        sopaNombre: sopa?.nombre || null,
        entradaNombre: entrada?.nombre || null,
        categoriaMenu,
        esAlmuerzoCompleto,
    };
}