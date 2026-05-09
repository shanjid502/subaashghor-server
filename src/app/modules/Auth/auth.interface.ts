export interface ISignup {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  token: string;
  password: string;
}
