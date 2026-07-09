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
      <span className="font-black text-black">{formatCurrecy(amount)}</span>
      {totalAmount !== undefined && (
        <span className="text-sm text-slate-500">
          / {formatCurrecy(totalAmount)}
        </span>
      )}
    </p>
  )
}
