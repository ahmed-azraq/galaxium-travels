import type { InputHTMLAttributes } from 'react';
import { TextInput } from '@carbon/react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  id: string;
}

export const Input = ({
  label,
  error,
  className,
  id,
  type,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled,
  required,
  name,
  autoComplete,
}: InputProps) => {
  return (
    <TextInput
      id={id}
      labelText={label || ''}
      invalid={!!error}
      invalidText={error}
      hideLabel={!label}
      className={className}
      type={type}
      placeholder={placeholder}
      value={value as string | number | undefined}
      defaultValue={defaultValue as string | number | undefined}
      onChange={onChange as any}
      onBlur={onBlur as any}
      disabled={disabled}
      required={required}
      name={name}
      autoComplete={autoComplete}
    />
  );
};

// Made with Bob
