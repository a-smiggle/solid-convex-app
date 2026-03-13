export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};