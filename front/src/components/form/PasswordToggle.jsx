import { Eye, EyeOff } from 'lucide-react'

function PasswordToggle({ visible, onToggle }) {
  const Icon = visible ? Eye : EyeOff

  return (
    <button
      className="password-toggle"
      type="button"
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      aria-pressed={visible}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" />
    </button>
  )
}

export default PasswordToggle
