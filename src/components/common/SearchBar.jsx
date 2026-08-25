import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import './common.css'

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  value = '',
  delay = 400,
  className = '',
}) => {
  const [query, setQuery] = useState(value)
  const debounced = useDebounce(query, delay)

  useEffect(() => {
    onSearch?.(debounced)
  }, [debounced, onSearch])

  return (
    <div className={['searchbar', className].filter(Boolean).join(' ')}>
      <svg
        className="searchbar__icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="searchbar__input"
        placeholder={placeholder}
      />

      {query && (
        <button
          className="searchbar__clear"
          onClick={() => {
            setQuery('')
            onSearch?.('')
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchBar
