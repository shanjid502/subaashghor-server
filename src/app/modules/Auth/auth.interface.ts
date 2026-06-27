export type TLoginUser = {
  email: string;
  password: string;
};

export type TUserRole = 'ADMIN' | 'USER';

export type TLoginResponse = {
  user: {
    userId: string;
    email: string;
    role: TUserRole;
  };
};
