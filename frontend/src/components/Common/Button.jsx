import React from 'react'

const Button = ({ 
  onClick, 
  text, 
  className = '', 
  disabled = false, 
  type = 'button' 
}) => {
  const baseClasses = 'text-white font-medium rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {text}
    </button>
  )
}

export default Button