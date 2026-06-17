import React from 'react';
import './Button.css';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const buttonClass = `
    btn
    btn-${variant}
    btn-${size}
    ${fullWidth ? 'btn-full' : ''}
    ${disabled ? 'btn-disabled' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
