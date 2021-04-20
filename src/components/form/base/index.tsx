import React from 'react';
import { formContext } from './context';
import InternalForm, {FormProps} from './Form';
import FormItem from './FormItem';

const Form: React.FC<FormProps> = (props) => {
  const [formFields, setFormFields] = React.useState({});
  
  return (
    <formContext.Provider value={[formFields, setFormFields]}>
      <InternalForm {...props}/>
    </formContext.Provider>
  )
}

export {FormItem};
export default Form;
