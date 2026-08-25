import './common.css'

const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  showPercent = true,
  color = 'primary',
  size = 'md',
  animated = false,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="progress-wrap">
      {(label || showPercent) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showPercent && (
            <span className="progress-pct">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <div
        className={[
          'progress-track',
          `progress-track--${size}`,
        ].join(' ')}
      >
        <div
          className={[
            'progress-fill',
            `progress-fill--${color}`,
            animated ? 'progress-fill--animated' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar