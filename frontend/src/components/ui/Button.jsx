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
  const baseClasses = 'h-14 font-label-md text-label-md rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-sm'
  
  const variants = {
    primary: 'bg-primary-container text-on-primary hover:bg-primary focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-surface-container-lowest text-primary-container ring-1 ring-primary-container hover:bg-surface-container-low focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'bg-transparent border-2 border-primary-container text-primary-container hover:bg-primary-container/10 focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-primary-container hover:bg-surface-container-low focus:ring-primary-container disabled:opacity-50 disabled:cursor-not-allowed',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[24px]">{icon}</span>}
      {children}
    </button>
  )
}
