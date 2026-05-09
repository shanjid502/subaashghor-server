export interface IProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface IProfileUpdate {
  name?: string;
  phone?: string;
  avatar?: string;
}
