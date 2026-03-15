export type AuthRole = "owner" | "admin" | "billing" | "user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};
