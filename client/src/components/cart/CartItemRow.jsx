import { Minus, Plus, Trash2 } from 'lucide-react'
import { currency } from '../../utils/helpers'

function CartItemRow({ item, onUpdate, onRemove }) {
  return (
    <div className="glass-panel flex gap-4 rounded-[24px] p-4">
      <img src={item.image} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl">{item.name}</h3>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item._id)}
              className="rounded-full p-2 text-muted transition hover:bg-surface-strong hover:text-primary"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-2 py-1">
            <button
              type="button"
              onClick={() => onUpdate(item._id, item.quantity - 1)}
              className="rounded-full p-2 transition hover:bg-surface-strong"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdate(item._id, item.quantity + 1)}
              className="rounded-full p-2 transition hover:bg-surface-strong"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-sm font-semibold text-primary">
            {currency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CartItemRow
