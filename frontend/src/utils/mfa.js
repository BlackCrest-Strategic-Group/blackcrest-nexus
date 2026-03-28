/**
 * MFA utility helpers for the frontend.
 * Handles saving and retrieving pending MFA state during the login flow.
 */

const MFA_STATE_KEY = "govcon_mfa_pending";

/**
 * Save the pending MFA login state to sessionStorage.
 * @param {{ mfaToken: string, mfaMethods: string[] }} state
 */
export function saveMfaState(state) {
  sessionStorage.setItem(MFA_STATE_KEY, JSON.stringify(state));
}

/**
 * Retrieve the pending MFA login state from sessionStorage.
 * @returns {{ mfaToken: string, mfaMethods: string[] } | null}
 */
export function getMfaState() {
  try {
    const raw = sessionStorage.getItem(MFA_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the pending MFA login state from sessionStorage.
 */
export function clearMfaState() {
  sessionStorage.removeItem(MFA_STATE_KEY);
}

/**
 * Format a phone number for display, showing only the last 4 digits.
 * @param {string} phone - Full phone number
 * @returns {string}
 */
export function maskPhone(phone) {
  if (!phone) return "";
  return `***-***-${phone.slice(-4)}`;
}

/**
 * Validate a 6-digit OTP code.
 * @param {string} otp
 * @returns {boolean}
 */
export function isValidOtp(otp) {
  return /^\d{6}$/.test(otp);
}

/**
 * Validate a phone number in E.164 format.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^\+\d{7,15}$/.test(phone);
}
