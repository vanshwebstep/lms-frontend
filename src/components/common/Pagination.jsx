import './common.css'

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  loading = false,
}) => {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2

  for (
    let i = Math.max(1, page - delta);
    i <= Math.min(totalPages, page + delta);
    i++
  ) {
    pages.push(i)
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
      >
        ← Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>
            1
          </button>

          {pages[0] > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={[
            'page-btn',
            p === page ? 'page-btn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="page-ellipsis">…</span>
          )}

          <button
            className="page-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || loading}
      >
        Next →
      </button>
    </div>
  )
}

export default Pagination