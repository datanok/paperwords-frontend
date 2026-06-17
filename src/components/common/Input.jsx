import React from 'react';
import './Input.css';

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  disabled = false,
  maxLength,
  className = '',
  error = null,
  label = null,
  id = null,
  required = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-wrapper ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        className="input-field"
        required={required}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};
