import Loader from './Loader'
import EmptyState from './EmptyState'
import './common.css'

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyText = 'No data found',
  onRowClick,
}) => {
  if (loading) return <Loader text="Loading data..." />

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="table-th"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState message={emptyText} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className={[
                  'table-row',
                  onRowClick ? 'table-row--clickable' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table