import { apiClient, ENDPOINTS } from "../api/apiClient";
import { User } from "../../domain/entities/User";

const SESSION_KEY = "estate_core_session";

export const AuthRepositoryImpl = {
  /**
   * Calls the register-and-login endpoint.
   * On success, persists the session to localStorage and returns a User entity.
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<User>}
   * @throws  Propagates API errors (wrong credentials, server errors, etc.) to the caller.
   */
  async loginOrRegister(name, email, password) {
    const payload  = { name, email, password };
    const response = await apiClient.post(ENDPOINTS.auth, payload);

    const status = response?.message?.status;
    if (status !== "Success") {
      throw new Error(response?.message?.message || "Authentication failed. Please try again.");
    }

    const token = response?.message?.token ?? "";
    const user  = new User({
      email: response?.message?.user || email,
      name:  name || email,
      token,
    });

    this.saveSession(user);
    return user;
  },

  /**
   * Authenticates an existing user via the dedicated login endpoint.
   * Response shape: { message: { status: "Success", token: "eyJ...", expires_at: 1234567890 } }
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<User>}
   * @throws  Propagates API errors (wrong credentials, locked account, etc.) to the caller.
   */
  async login(email, password) {
    const payload  = { email, password };
    const response = await apiClient.post(ENDPOINTS.login, payload);

    const status = response?.message?.status;
    if (status !== "Success") {
      throw new Error(response?.message?.message || "Invalid email or password.");
    }

    const token = response?.message?.token ?? "";

    // Derive a readable display name from the email prefix
    // e.g. "samuelbuyer@example.com" → "Samuelbuyer"
    const namePart   = email.split("@")[0] ?? email;
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user = new User({
      email,
      name: displayName,
      token,
    });

    this.saveSession(user);
    return user;
  },

  /**
   * Authenticates an administrator via the dedicated admin login endpoint.
   * Admin sessions are stored in sessionStorage only — never in localStorage —
   * so they never mix with the regular user auth context.
   *
   * @param {string} username  - admin username (may not be email-format)
   * @param {string} password
   * @returns {Promise<{ token: string, username: string }>}
   * @throws  Propagates API errors to the caller.
   */
  async adminLogin(username, password) {
    // The Frappe endpoint accepts the credential as "email" even for username-style values
    const payload  = { email: username, password };
    const response = await apiClient.post(ENDPOINTS.adminLogin, payload);

    const status = response?.message?.status;
    if (status !== "Success") {
      throw new Error(response?.message?.message || "Invalid administrator credentials.");
    }

    return {
      token:    response?.message?.token ?? "",
      username: response?.message?.user  ?? username,
    };
  },

  /**
   * Persists or clears the authenticated user in localStorage.
   * @param {User|null} user
   */
  saveSession(user) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  /**
   * Restores the user session from localStorage on page load.
   * @returns {User|null}
   */
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return new User(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  /**
   * Clears the persisted session (logout).
   */
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },
};
