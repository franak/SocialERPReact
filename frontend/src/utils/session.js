/**
 * Session storage utilities for employee code and last presence data.
 * Uses sessionStorage so data is cleared when the tab closes.
 */

const EMPLOYEE_CODE_KEY = 'empleadoCode';
const LAST_PARTE_KEY = 'ultimoParte';
const UUID_CUENTA_CONTABLE_KEY = 'uuidCuentaContable';
const UUID_CENTRAL_KEY = 'uuidCentral';

/**
 * Save employee code to session storage.
 * @param {string} code
 */
export function saveEmployeeCode(code) {
    if (!code || !code.trim()) return;
    sessionStorage.setItem(EMPLOYEE_CODE_KEY, code.trim());
}

/**
 * Get employee code from session storage.
 * @returns {string|null}
 */
export function getEmployeeCode() {
    return sessionStorage.getItem(EMPLOYEE_CODE_KEY);
}

/**
 * Remove employee code from session storage (logout).
 */
export function clearEmployeeCode() {
    sessionStorage.removeItem(EMPLOYEE_CODE_KEY);
}

/**
 * Check if employee code exists in session storage.
 * @returns {boolean}
 */
export function hasEmployeeCode() {
    return !!getEmployeeCode();
}

/**
 * Save ultimo parte data to session storage.
 * @param {object} parteData - The response data from ultimo parte API call
 */
export function saveUltimoParte(parteData) {
    if (!parteData) return;
    sessionStorage.setItem(LAST_PARTE_KEY, JSON.stringify(parteData));

    if (parteData.UUIDCuentaContable) {
        saveUUIDCuentaContable(parteData.UUIDCuentaContable);
    }
    if (parteData.UUIDCentral) {
        saveUUIDCentral(parteData.UUIDCentral);
    }
}

/**
 * Get ultimo parte data from session storage.
 * @returns {object|null}
 */
export function getUltimoParte() {
    const data = sessionStorage.getItem(LAST_PARTE_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

/**
 * Clear ultimo parte data from session storage.
 */
export function clearUltimoParte() {
    sessionStorage.removeItem(LAST_PARTE_KEY);
}

/**
 * Save UUIDCuentaContable to session storage.
 * @param {string} uuid - The UUID Cuenta Contable from ultimo parte response
 */
export function saveUUIDCuentaContable(uuid) {
    if (!uuid) return;
    sessionStorage.setItem(UUID_CUENTA_CONTABLE_KEY, uuid);
}

/**
 * Get UUIDCuentaContable from session storage.
 * @returns {string|null}
 */
export function getUUIDCuentaContable() {
    return sessionStorage.getItem(UUID_CUENTA_CONTABLE_KEY);
}

/**
 * Save UUIDCentral to session storage.
 * @param {string} uuid - The UUID Central from ultimo parte response
 */
export function saveUUIDCentral(uuid) {
    if (!uuid) return;
    sessionStorage.setItem(UUID_CENTRAL_KEY, uuid);
}

/**
 * Get UUIDCentral from session storage.
 * @returns {string|null}
 */
export function getUUIDCentral() {
    return sessionStorage.getItem(UUID_CENTRAL_KEY);
}

/**
 * Clear UUIDCuentaContable from session storage.
 */
export function clearUUIDCuentaContable() {
    sessionStorage.removeItem(UUID_CUENTA_CONTABLE_KEY);
}

/**
 * Clear all session data (logout).
 */
export function clearAllSession() {
    clearEmployeeCode();
    clearUltimoParte();
    clearUUIDCuentaContable();
    sessionStorage.removeItem('uuidCentral');
}