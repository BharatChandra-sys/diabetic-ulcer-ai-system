export default function Card({ children, className = '', onClick = null, hover = false }) {
  const hoverClasses = hover ? 'hover:bg-surface-container-low cursor-pointer' : ''
  
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm transition-colors ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  )
}
