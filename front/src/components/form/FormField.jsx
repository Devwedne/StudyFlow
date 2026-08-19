import { forwardRef } from 'react'

const FormField = forwardRef(function FormField(
  { id, label, error, Icon, endAdornment, ...inputProps },
  ref,
) {
  const errorId = `${id}-error`
  const input = (
    <input
      {...inputProps}
      ref={ref}
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
    />
  )

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {Icon || endAdornment ? (
        <div className={`input-wrap${error ? ' input-wrap-error' : ''}`}>
          {Icon && <Icon className={Icon.displayName === 'LockKeyhole' ? 'lock-icon' : undefined} aria-hidden="true" />}
          {input}
          {endAdornment}
        </div>
      ) : input}
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  )
})

export default FormField
