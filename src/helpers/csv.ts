export function toCsv(rows: string[][], delimiter: string) {
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(delimiter)).join('\r\n')
}

export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
