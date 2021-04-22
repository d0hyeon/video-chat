
export type User = {
  id: string;
  name: string;
  message: string;
}

export type Room = {
  id: string;
  title: string;
  description?: string;
  users: User[];
  size: number;
  isPassword?: boolean;
}

export interface Rule {
  regex: RegExp;
  message: string;
}