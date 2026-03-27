import { Minus, Plus, Trash2 } from 'lucide-react'
import { currency, getCloudinaryImageUrl } from '../../utils/helpers'

function CartItemRow({ item, onUpdate, onRemove }) {
  return (
    <div className="glass-panel flex gap-4 rounded-[24px] p-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-bg-strong via-surface-strong to-bg p-2">
        <img
          src={getCloudinaryImageUrl(item.image, {
            width: 240,
            height: 240,
            crop: 'fit',
          })}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>
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
