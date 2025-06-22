export interface SignI {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginI {
    email: string;
    password: string;
}