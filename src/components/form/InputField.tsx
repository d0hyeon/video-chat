import React, { ChangeEvent, ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from 'react';
import styled from '@emotion/styled';
import { throttle } from 'throttle-debounce';
import { Rule } from '@src/types';

interface Props {
  defaultValue?: string;
  name?: string;
  type?: 'text' | 'password' | 'number';
  icon?: React.ReactNode;
  placeholder?: string;
  onChange: (value: string) => void;
  rules?: Rule[];
  required?: boolean
}
const InputField: React.FC<Props> = ({
  onChange,
  name = '',
  type = 'text',
  placeholder,
  icon,
  defaultValue = '',
  required = false,
  rules = []
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState<string>(defaultValue);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const validateRules = React.useCallback((value): boolean => {
    if(required && !value) {
      setErrorMessage('입력해주세요.');
      return false;
    }
    const isComplete = rules.every(({regex, message}) => {
      if(regex && !regex.test(value)) {
        setErrorMessage(message);
        return false;
      }
      return true;
    });
    if(isComplete) {
      setErrorMessage('');
    }
    return isComplete;
  }, [rules, required, value, setErrorMessage]);

  const inputKeyupHandler = React.useCallback<KeyboardEventHandler<HTMLInputElement>>(({key}) => {
    if(key !== 'Tab') {
      validateRules(inputRef.current?.value ?? ''); 
    }
  }, [validateRules, inputRef]);

  const throttledKeyupHandler = React.useMemo(() => throttle(200, inputKeyupHandler), [inputKeyupHandler]);

  const inputBlurHandler = React.useCallback<FocusEventHandler<HTMLInputElement>>(({target: {value}}) => {
    validateRules(value);
  }, [validateRules]);

  const inputChangeHandler = React.useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const {target: {value}} = event;
    setValue(value);
    validateRules(value);
  }, [setValue, validateRules]);

  React.useEffect(() => {
    onChange && onChange(errorMessage ? '' : value);
  }, [value, errorMessage, onChange]);

  return (
    <Wrapper className="input-field">
      <Field active={!!value}>
        <FieldLabel>
          {placeholder && (
            <FieldLabelText>{placeholder}</FieldLabelText>
          )}
          <FieldInput 
            ref={inputRef}
            name={name}
            type={type} 
            value={value} 
            onChange={inputChangeHandler} 
            onBlur={inputBlurHandler}
            onKeyUp={throttledKeyupHandler}
          />
        </FieldLabel>
        {icon && (
          <FieldIcon>{icon}</FieldIcon>
        )}
      </Field>
      {errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
      )}
    </Wrapper>
  )
};

InputField.displayName = 'InputField';
export default React.memo(InputField);

const Wrapper = styled.div`

`;

const ErrorMessage = styled.p`
  margin-top: 10px;
  font-size: 14px;
  color: red;
`;

const FieldIcon = styled.i`
  flex: 1 1 auto;
  padding-right: 8px;
`

const FieldLabel = styled.label`
  flex: 1 1 auto;
  width: 100%;
  cursor: text;
`;

const FieldLabelText = styled.span`
  position: absolute;
  left: 10px;
  top: 0;
  transform-origin: 0 50%;
  transition: all 300ms;
  color: #999;
  line-height: 36px;
  font-size: 14px;
`;

const FieldInput = styled.input`
  border: 0;
  width: 100%;
  height: 100%;

  &:focus {
    outline: none;
  }
`

const Field = styled.div<{active: boolean}>`
  display: flex;
  position: relative;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  align-items: center;

  ${({active}) => active && `
    ${FieldLabelText} {
      transform: scale(.833) translateY(-10px);
    }
    ${FieldInput} {
      padding-top: 10px;
    }
  `}
`;