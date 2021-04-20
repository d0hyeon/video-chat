import React, { FormEventHandler } from 'react';
import styled from '@emotion/styled';
import { formContext } from './context';

type FormDataState = {
  [key: string]: string;
}

export interface FormProps {
  onSubmit: <T = FormDataState>(formData: T) => void;
  children: React.ReactNode | React.ComponentType;
}

const Form: React.FC<FormProps> = ({onSubmit, children}) => {
  const [formData] = React.useContext(formContext);
  const formValues = React.useMemo(() => Object.values(formData), [formData]);
  const isComplete = React.useMemo(() => formValues.every(val => !!val), [formValues]);

  const formSubmitHandler = React.useCallback<FormEventHandler>((e) => {
    e.preventDefault();
    if(isComplete) {
      onSubmit(formData);
    }
  }, [onSubmit, formData, isComplete]);

  return (
    <form onSubmit={formSubmitHandler}>
      {children}
    </form>
  )
};


Form.displayName = 'Form';
export default React.memo(Form);
