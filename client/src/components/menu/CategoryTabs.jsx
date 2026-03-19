function CategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => {
        const active = category === activeCategory
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text hover:bg-surface-strong'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
