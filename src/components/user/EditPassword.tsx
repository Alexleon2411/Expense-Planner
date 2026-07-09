import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"

type Props = {
  onClose: () => void
}

export default function EditPassword({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { updatePassword } = useAuth()

  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      await updatePassword(currentPassword, newPassword)
      setSuccess("Password updated successfully")
      setTimeout(() => onClose(), 1500)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update password")
    }
  }

  return (
    <div>
      <div
        className="fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-lg"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div className="max-w-lg mx-auto bg-white rounded-md p-lg" onClick={(e) => e.stopPropagation()}>
          <div className="bento-card">
            <span className="text-label-caps text-on-surface-variant mb-xl block">CHANGE PASSWORD</span>

            {error && (
              <div className="mb-md p-md bg-red-50 border border-red-200 rounded-lg text-red-600 text-body-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-md p-md bg-green-50 border border-green-200 rounded-lg text-green-600 text-body-sm">
                {success}
              </div>
            )}

            <div className="space-y-lg">
              <div>
                <label className="block text-body-sm font-bold mb-xs">Current Password</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-body-sm font-bold mb-xs">New Password</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-body-sm font-bold mb-xs">Confirm New Password</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-md pt-md">
            <button
              className="px-lg py-sm border border-outline-variant bg-white text-on-surface font-bold rounded-lg hover:bg-surface-container transition-colors text-body-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-lg py-sm bg-primary text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 hover:bg-white transform active:scale-95 transition-all text-body-md"
              onClick={handleSubmit}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
