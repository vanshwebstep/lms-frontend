import { getInitials } from '../../utils/helpers'
import './common.css'

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizes = { xs: 28, sm: 36, md: 44, lg: 56, xl: 80 }
  const px = sizes[size] || 44
  const fontSize = px * 0.36

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'avatar',
          `avatar--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      className={[
        'avatar',
        `avatar--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        flexShrink: 0,
        background:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'var(--font-heading)',
        userSelect: 'none',
      }}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar