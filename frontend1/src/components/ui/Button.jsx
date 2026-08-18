export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '',
  icon = null,
  fullWidth = true
}) {
  const baseClasses = 'h-10 font-label-sm text-[14px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-surface-container text-primary ring-1 ring-outline-variant hover:bg-surface-container-high focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'bg-transparent border border-outline text-on-surface hover:bg-surface-container focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-primary hover:bg-primary/5 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  )
}
