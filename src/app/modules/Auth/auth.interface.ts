export type TLoginUser = {
  email?: string;
  phone?: string;
  password?: string;
};

export type TUserRole = 'customer' | 'admin';

export type TSignupUser = {
  name: string;
  email?: string;
  password?: string;
  phone: string;
};
