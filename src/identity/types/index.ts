export interface SignI {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface OtpI{
  email: string;
  otp: string;
}

export interface LoginI {
  email: string;
  password: string;
}
