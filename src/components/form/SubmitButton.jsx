import { ArrowRight } from 'lucide-react'

function SubmitButton({ children, showArrow = false }) {
  return (
    <button className="primary-button" type="submit">
      <span>{children}</span>
      {showArrow && <ArrowRight aria-hidden="true" />}
    </button>
  )
}

export default SubmitButton
