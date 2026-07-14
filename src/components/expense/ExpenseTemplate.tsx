import { useState, useEffect, useRef } from "react"
import { useBudget } from "../../hooks/useBudget"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons'

type ExpenseCommentsProps = {
  expenseId: string
  expenseName?: string
  amount?: number
  category?: string
}

export default function ExpenseComments({ expenseId }: ExpenseCommentsProps) {
  const { createExpenseComment, listExpenseComments, deleteExpenseComment } = useBudget()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await listExpenseComments(expenseId)
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al cargar comentarios:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [expenseId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [comments])

  const handleAddComment = async () => {
    if (!newComment.trim() || sending) return
    setSending(true)
    try {
      const result = await createExpenseComment(expenseId, newComment.trim())
      if (result) {
        setComments(prev => [...prev, result])
      }
      setNewComment("")
    } catch (error) {
      console.error("Error al crear comentario:", error)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const confirmed = window.confirm("Seguro de que quiere eliminar este comentario?")
      if (confirmed)
      {
        await deleteExpenseComment(expenseId, commentId)
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error("Error al eliminar comentario:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins} min`
    if (diffHours < 24) return `${diffHours} h`
    if (diffDays < 7) return `${diffDays} d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="w-full bg-white   flex flex-col font-sans antialiased text-black selection:bg-blue-100">

      {/* Feed de comentarios */}
      <div ref={listRef} className="overflow-y-auto px-4 py-4 space-y-4 scroll-smooth max-h-64">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-slate-400 text-xl" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
            {/* <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center mb-2">
              <span className="text-2xl font-light text-slate-400">+</span>
            </div> */}
            <p className="font-bold text-base text-slate-700">Aún no hay comentarios</p>
            <p className="text-slate-400 text-xs mt-1 max-w-[220px]">Las aclaraciones o notas de este pago aparecerán aquí.</p>
          </div>
        ) : (
          [...comments].reverse().map((comment: any) => (
            <div key={comment.id} className="flex items-start gap-3 group animate-fadeIn">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 border border-slate-200 shadow-inner">
                {comment.userId ? comment.userId.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-slate-900 leading-snug break-words">
                  <span className="font-bold mr-1.5 text-slate-800 text-xs">
                    {comment.userId ? `usuario_${comment.userId.slice(0, 4)}` : 'anonimo'}
                  </span>
                  {comment.comment}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-400">
                  <span>{formatRelativeTime(comment.createdAt)}</span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input inferior */}
      <div className="border-t border-slate-100 px-4 py-3 bg-white shrink-0">
        <div className="flex gap-3 items-center bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-slate-400 transition-all duration-150">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Agrega un comentario..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder-slate-400 text-slate-900 max-h-20 py-0.5 leading-tight"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || sending}
            className="text-blue-500 font-bold text-sm hover:text-blue-700 disabled:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? (
              <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
            ) : (
              "Publicar"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
