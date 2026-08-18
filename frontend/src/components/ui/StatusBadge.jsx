export default function StatusBadge({ status, text, icon = null }) {
  const statusConfig = {
    success: {
      bgColor: 'bg-primary-container',
      textColor: 'text-on-primary-container',
      icon: icon || 'check_circle',
    },
    warning: {
      bgColor: 'bg-tertiary-container',
      textColor: 'text-on-tertiary-container',
      icon: icon || 'warning',
    },
    error: {
      bgColor: 'bg-error-container',
      textColor: 'text-on-error-container',
      icon: icon || 'error',
    },
    info: {
      bgColor: 'bg-secondary-container',
      textColor: 'text-on-secondary-container',
      icon: icon || 'info',
    },
  }

  const config = statusConfig[status] || statusConfig.info

  return (
    <div
      className={`flex items-center gap-xs ${config.bgColor} ${config.textColor} px-sm py-1 rounded-full w-max font-label-md text-label-md`}
    >
      <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
      <span>{text}</span>
    </div>
  )
}
