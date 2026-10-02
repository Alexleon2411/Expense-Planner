import { formatCurrecy } from "../helpers"

type AmountDisplayProps = {
  label?: string
  amount: number,
  totalAmount?: number
}


export default function AmountDisplay({label, amount, totalAmount} : AmountDisplayProps) {
  return (
    <p className="text-2xl text-blue-600 font-bold ">
      {label && `${label}: `}
      <span className="font-black text-on-surface">{formatCurrecy(amount)}</span>
      {totalAmount !== undefined && (
        <span className="text-sm text-on-surface-variant">
          / {formatCurrecy(totalAmount)}
        </span>
      )}
    </p>
  )
}
