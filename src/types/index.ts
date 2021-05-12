
export interface User {
  id: string;
  name: string;
  message: string;
}

export interface ChatOption {
  video: boolean;
  audio: boolean;
}

export interface UserWithInRoom extends User {
  option: ChatOption
}

export interface Room {
  id: string;
  title: string;
  description?: string;
  users: UserWithInRoom[];
  size: number;
  isPassword?: boolean;
}

export interface Rule {
  regex: RegExp;
  message: string;
}