/**
 * Section registry - Add new sections here to auto-generate cards and routes.
 *
 * Properties:
 *   id          - Unique identifier (used for route path and key)
 *   name        - Display name on the landing page card
 *   description - Short description shown on the card
 *   icon        - SVG icon component name (or emoji as fallback)
 *   route       - URL path for the section
 *   requiresAuth - 'employee' | 'superuser' | null
 *                  - 'employee'  : requires empleadoCode in sessionStorage
 *                  - 'superuser' : requires admin JWT token
 *                  - null        : public, no auth needed
 *   adminOnly   - boolean, if true only accessible by logged-in superuser
 */

export const SECTIONS = [
    {
        id: 'registro-horario',
        name: 'Registro Horario',
        description: 'Control de entrada, salida y horas extras',
        icon: '🕐',
        route: '/reloj',
        requiresAuth: 'employee',
        adminOnly: false,
    },
    {
        id: 'calendario',
        name: 'Calendario',
        description: 'Gestión de vacaciones, ausencias y eventos',
        icon: '📅',
        route: '/calendario',
        requiresAuth: 'employee',
        adminOnly: false,
    },
    {
        id: 'nominas',
        name: 'Nóminas',
        description: 'Consulta de nóminas y recibos de pago',
        icon: '💰',
        route: '/nominas',
        requiresAuth: 'employee',
        adminOnly: false,
    },
    {
        id: 'historial',
        name: 'Historial',
        description: 'Historial de entradas y salidas',
        icon: '📊',
        route: '/historial',
        requiresAuth: 'employee',
        adminOnly: false,
    },
];

/**
 * Admin-only sections (visible only to logged-in superuser)
 */
export const ADMIN_SECTIONS = [
    {
        id: 'admin-logs',
        name: 'Log de Eventos',
        description: 'Visualización de logs del sistema',
        icon: '📋',
        route: '/admin/logs',
        requiresAuth: 'superuser',
        adminOnly: true,
    },
    {
        id: 'admin-calendarios',
        name: 'Calendarios Empleados',
        description: 'Listado de eventos de todos los empleados',
        icon: '📆',
        route: '/admin/calendarios',
        requiresAuth: 'superuser',
        adminOnly: true,
    },
];

/**
 * Helper: get section by route path
 */
export function getSectionByRoute(path) {
    return [...SECTIONS, ...ADMIN_SECTIONS].find((s) => s.route === path);
}

/**
 * Helper: filter sections by auth type
 */
export function getSectionsForRole(role) {
    if (role === 'superuser') {
        return [...SECTIONS, ...ADMIN_SECTIONS];
    }
    return SECTIONS;
}
