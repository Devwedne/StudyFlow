import { ArrowRight } from 'lucide-react'

function SubmitButton({ children, showArrow = false, disabled = false }) {
  return (
    <button className="primary-button" type="submit" disabled={disabled}>
      <span>{children}</span>
      {showArrow && <ArrowRight aria-hidden="true" />}
    </button>
  )
}

export default SubmitButton
