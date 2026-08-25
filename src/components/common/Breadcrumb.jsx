import { Link } from 'react-router-dom'
import './common.css'

const Breadcrumb = ({ items = [] }) => (
  <nav className="breadcrumb">
    {items.map((item, i) => (
      <span key={i} className="breadcrumb__item">
        {i > 0 && <span className="breadcrumb__sep">/</span>}

        {item.to && i < items.length - 1 ? (
          <Link to={item.to} className="breadcrumb__link">
            {item.label}
          </Link>
        ) : (
          <span className="breadcrumb__current">
            {item.label}
          </span>
        )}
      </span>
    ))}
  </nav>
)

export default Breadcrumb