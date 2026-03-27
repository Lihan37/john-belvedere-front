import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { currency, getCloudinaryImageUrl } from '../../utils/helpers'

function MenuCard({ item, onAdd }) {
  const hasImage = Boolean(item.image)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel flex h-full flex-col overflow-hidden rounded-[28px]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-bg-strong via-surface-strong to-bg">
        {hasImage ? (
          <img
            src={getCloudinaryImageUrl(item.image, {
              width: 720,
              height: 540,
              crop: 'fit',
            })}
            alt={item.name}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="h-full w-full object-contain p-4 transition duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-strong via-surface-strong to-bg text-center">
            <div className="px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                John Belvedere
              </p>
              <h3 className="mt-3 font-display text-3xl text-text">{item.name}</h3>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              {item.category}
            </p>
            <h3 className="font-display text-2xl">{item.name}</h3>
          </div>
          <p className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {currency(item.price)}
          </p>
        </div>
        <p className="mt-4 flex-1 text-sm leading-6 text-muted">{item.description}</p>
        <button
          type="button"
          onClick={() => onAdd(item)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-text px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
        >
          <Plus size={16} />
          Add to cart
        </button>
      </div>
    </motion.article>
  )
}

export default MenuCard
