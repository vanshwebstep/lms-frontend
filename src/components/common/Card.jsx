import './common.css'

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  glow = false,
  onClick,
  style = {},
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        'card-comp',
        `card-comp--pad-${padding}`,
        hover ? 'card-comp--hover' : '',
        glow ? 'card-comp--glow' : '',
        onClick ? 'card-comp--clickable' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={['card-header', className].filter(Boolean).join(' ')}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={['card-title', className].filter(Boolean).join(' ')}>
    {children}
  </h3>
)

export const CardBody = ({ children, className = '' }) => (
  <div className={['card-body', className].filter(Boolean).join(' ')}>
    {children}
  </div>
)

export default Card