import type { ReactNode } from 'react'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  footer?: ReactNode
  align?: 'left' | 'right'
  hideBelow?: 'sm' | 'md'
}

interface DataTableProps<Row> {
  caption: string
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  empty?: ReactNode
}

const HIDE_CLASSES = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
}

export default function DataTable<Row>({ caption, columns, rows, getRowKey, empty }: DataTableProps<Row>) {
  if (rows.length === 0 && empty) return <>{empty}</>

  const hasFooter = columns.some((column) => column.footer !== undefined)

  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent"
    >
      <table className="w-full min-w-[480px] border-collapse text-left text-ui-table tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="h-8 border-b border-ui-border">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-2 align-middle text-ui-label font-semibold uppercase text-ui-fg-muted ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.hideBelow ? HIDE_CLASSES[column.hideBelow] : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="h-11 border-b border-ui-border last:border-b-0 hover:bg-ui-elevated">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-2 align-middle text-ui-fg ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.hideBelow ? HIDE_CLASSES[column.hideBelow] : ''}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {hasFooter && (
          <tfoot>
            <tr className="h-11 border-t border-ui-control font-semibold">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-2 align-middle text-ui-fg ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.hideBelow ? HIDE_CLASSES[column.hideBelow] : ''}`}
                >
                  {column.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
