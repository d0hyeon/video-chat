import { User } from './../types/index';
import { atom, selector } from 'recoil';

const STORAGE_KEY = 'CHAT_APP';
const STORAGE_USER_KEY = 'USER';
const localStorageUser = localStorage.getItem(`${STORAGE_KEY}/${STORAGE_USER_KEY}`);

export const userState = atom<User>({
  key: 'userState',
  default:  localStorageUser ? JSON.parse(localStorageUser) : null,
});

export const userSelector = selector<User | null>({
  key: 'userSelector',
  get: ({get}) => get(userState),
  set: ({set}, state) => {
    localStorage.setItem(`${STORAGE_KEY}/${STORAGE_USER_KEY}`, JSON.stringify(state));
    set(userState, state as User);
  }
}) 