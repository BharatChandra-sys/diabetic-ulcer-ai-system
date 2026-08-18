export default function StatusBadge({ status = 'low' }) {
  const getConfig = () => {
    switch (status.toLowerCase()) {
      case 'low':
        return {
          icon: 'check_circle',
          label: 'Low Risk',
          bgColor: 'bg-primary-container',
          textColor: 'text-on-primary-container'
        }
      case 'medium':
        return {
          icon: 'warning',
          label: 'Medium Risk',
          bgColor: 'bg-tertiary-container',
          textColor: 'text-on-tertiary-container'
        }
      case 'high':
        return {
          icon: 'error',
          label: 'High Risk',
          bgColor: 'bg-error-container',
          textColor: 'text-on-error-container'
        }
      default:
        return {
          icon: 'check_circle',
          label: 'Low Risk',
          bgColor: 'bg-primary-container',
          textColor: 'text-on-primary-container'
        }
    }
  }

  const config = getConfig()

  return (
    <div className={`flex items-center gap-xs ${config.bgColor} ${config.textColor} px-sm py-1 rounded-full w-max`}>
      <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
      <span className="font-label-md text-label-md">{config.label}</span>
    </div>
  )
}
