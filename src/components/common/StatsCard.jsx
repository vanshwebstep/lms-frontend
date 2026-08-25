import './common.css'

const StatsCard = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  color = 'primary',
  loading = false,
}) => {
  const isPositive = parseFloat(change) >= 0

  return (
    <div className={['stats-card', `stats-card--${color}`].join(' ')}>
      <div className="stats-card__top">
        <div className="stats-card__info">
          <p className="stats-card__title">{title}</p>

          {loading ? (
            <div
              className="skeleton"
              style={{ height: 32, width: 100, marginTop: 6 }}
            />
          ) : (
            <h2 className="stats-card__value">{value}</h2>
          )}
        </div>

        <div className="stats-card__icon">{icon}</div>
      </div>

      {change !== undefined && (
        <div className="stats-card__change">
          <span className={isPositive ? 'change-up' : 'change-down'}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>

          {changeLabel && (
            <span className="change-label">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default StatsCard