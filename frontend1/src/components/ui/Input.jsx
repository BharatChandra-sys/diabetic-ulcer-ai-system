import { useState } from 'react'

export default function Input({
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  autoComplete = '',
  showPasswordToggle = false,
  error = null,
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="font-label-sm text-[13px] text-on-surface-variant flex justify-between items-center"
        >
          <span>{label}</span>
        </label>
      )}
      <div className="relative w-full">
        <input
          type={inputType}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`h-10 w-full px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-[14px] border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all ${
            showPasswordToggle ? 'pr-16' : ''
          } ${error ? 'border-error focus:border-error focus:ring-error' : ''}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1 h-8 px-2 flex items-center justify-center font-label-sm text-[12px] text-primary hover:bg-primary/5 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p className="text-error text-[12px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
