export class User {
  constructor({ email, name, token }) {
    this.email = email;
    this.name = name;
    this.token = token;
  }

  static fromRaw(raw) {
    if (!raw) return null;
    return new User({
      email: raw.email || raw.user || "",
      name: raw.name || "User",
      token: raw.token || "",
    });
  }
}
