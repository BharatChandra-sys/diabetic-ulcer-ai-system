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
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-xs w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-label-md text-label-md text-on-surface flex justify-between items-center"
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
          className={`h-14 w-full px-sm rounded-xl bg-surface-bright text-on-surface font-body-lg text-body-lg shadow-sm border-none focus:ring-2 focus:ring-primary-container focus:outline-none transition-shadow ${
            showPasswordToggle ? 'pr-[80px]' : ''
          } ${error ? 'ring-2 ring-error' : ''}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-14 px-sm flex items-center justify-center font-label-md text-label-md text-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container rounded-r-xl"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p className="text-error text-body-md font-body-md flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
