import React from 'react';

type State = {[key: string]: string};
type SetStateCallback = (prevState: State) => State;
type SetState = (nextValue: State | SetStateCallback) => void;

const INITIAL_STATE: [State, SetState] = [
  {},
  () => {}
]

export const formContext = React.createContext<[State, SetState]>(INITIAL_STATE);