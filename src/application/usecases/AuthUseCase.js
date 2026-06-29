import { AuthRepositoryImpl } from "../../infrastructure/repositories/AuthRepositoryImpl";

export const AuthUseCase = {
  /** Registration + auto-login (Sign Up page) */
  async loginOrRegister(name, email, password) {
    if (!email || !email.includes("@")) {
      throw new Error("A valid email address is required");
    }
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }
    return await AuthRepositoryImpl.loginOrRegister(name, email, password);
  },

  /** Dedicated login for existing accounts (Login page) */
  async login(email, password) {
    if (!email || email.trim() === "") {
      throw new Error("Email address or username is required");
    }
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }
    return await AuthRepositoryImpl.login(email, password);
  },

  getCurrentSession() {
    return AuthRepositoryImpl.getSession();
  },

  logout() {
    AuthRepositoryImpl.clearSession();
  },

  /**
   * Authenticates an administrator via the dedicated admin endpoint.
   * Does NOT touch the regular user session.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ token: string, username: string }>}
   */
  async adminLogin(username, password) {
    if (!username || username.trim() === "") {
      throw new Error("Administrator username is required.");
    }
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters long.");
    }
    return await AuthRepositoryImpl.adminLogin(username, password);
  },
};
