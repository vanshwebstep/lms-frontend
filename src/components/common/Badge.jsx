import './common.css'

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={[
        'badge-comp',
        `badge-comp--${variant}`,
        `badge-comp--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}

export default Badge