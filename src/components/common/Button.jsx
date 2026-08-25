import './common.css'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | ghost | danger | success
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconRight = null,
  className = '',
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading ? 'btn--loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <span className="btn-spinner" />}

      {!loading && icon && <span className="btn-icon">{icon}</span>}

      <span>{children}</span>

      {!loading && iconRight && (
        <span className="btn-icon">{iconRight}</span>
      )}
    </button>
  )
}

export default Button