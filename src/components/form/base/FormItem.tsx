import React from 'react';
import styled from '@emotion/styled';
import InputField from '../InputField';
import { formContext } from './context';
import { Rule } from '@src/types';

interface Props {
  name: string;
  type?: 'text' | 'password' | 'number';
  title?: string; 
  defaultValue?: string;
  rules?: Rule[];
  placeholder?: string;
  required?: boolean;
}

interface InnerProps extends Props {
  onChange: (value: string) => void;
}

const _InnerFormItem: React.FC<InnerProps> = ({
  name,
  type,
  title,
  defaultValue,
  placeholder,
  rules,
  required = false,
  onChange
}) => {
  return (
    <StyledFormItem>
      <InputField
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder ?? title ?? ''}
        onChange={onChange} 
        rules={rules}
        required={required}
      />
    </StyledFormItem>
  )
}

_InnerFormItem.displayName = 'InnerFormItem';
const InnerFormItem = React.memo(_InnerFormItem);

const FormItem: React.FC<Props> = (props) => {
  const {name, defaultValue, required = false} = props;
  const [_, setFormData] = React.useContext(formContext);

  const deleteFormData = React.useCallback(() => {
    setFormData(prev => {
      const next = {...prev};
      delete next[name];
      return next;
    })
  }, [setFormData]);

  const valueChangeHandler = React.useCallback((value) => {
    if(!required && !value) {
      deleteFormData();
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
  }, [name, required, setFormData, deleteFormData]);

  React.useEffect(() => {
    if(required) {
      valueChangeHandler(defaultValue)
    }

    return () => deleteFormData();
  }, [name, defaultValue, required, required, valueChangeHandler, deleteFormData]);
  
  return (
    <InnerFormItem 
      {...props} 
      defaultValue={defaultValue}
      onChange={valueChangeHandler} 
    />  
  )
}

FormItem.displayName = 'FormItem';
export default React.memo(FormItem);

const StyledFormItem = styled.div`
  & ~ & {
    margin-top: 20px;
  }
`