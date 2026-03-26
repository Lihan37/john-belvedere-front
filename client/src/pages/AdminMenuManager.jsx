import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ImagePlus, Pencil, Plus, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react'
import AppShell from '../components/common/AppShell'
import SectionHeading from '../components/common/SectionHeading'
import CategoryTabs from '../components/menu/CategoryTabs'
import {
  createAdminMenuItem,
  deleteAdminMenuItem,
  fetchAdminMenuItems,
  updateAdminMenuItem,
} from '../services/adminMenuService'
import { uploadMenuImage } from '../services/cloudinaryUploadService'
import { currency, getCloudinaryImageUrl, isDrinkCategory } from '../utils/helpers'
import { useToast } from '../context/useToast'

const initialForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  image: '',
}

function normalizeMenuPayload(form) {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    description: form.description.trim(),
    image: form.image.trim(),
  }
}

function getChangedMenuFields(nextPayload, previousItem) {
  return Object.fromEntries(
    Object.entries(nextPayload).filter(([key, value]) => {
      if (key === 'image' && value === '') {
        return false
      }

      const previousValue =
        key === 'price'
          ? Number(previousItem?.[key] ?? 0)
          : String(previousItem?.[key] ?? '')

      return value !== previousValue
    }),
  )
}

function AdminMenuManager() {
  const { showToast } = useToast()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)
  const [activeFoodJumpCategory, setActiveFoodJumpCategory] = useState('All')
  const [activeDrinkJumpCategory, setActiveDrinkJumpCategory] = useState('All')
  const sectionRefs = useRef({})

  const loadMenu = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      const items = await fetchAdminMenuItems()
      setMenuItems(items)
    } catch (err) {
      setError(err.message)
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadMenu()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(menuItems.map((item) => item.category))).sort((left, right) => left.localeCompare(right)),
    [menuItems],
  )

  const groupedItems = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: menuItems.filter((item) => item.category === category),
      })),
    [categories, menuItems],
  )

  const foodGroups = useMemo(
    () => groupedItems.filter((group) => !isDrinkCategory(group.category)),
    [groupedItems],
  )

  const drinkGroups = useMemo(
    () => groupedItems.filter((group) => isDrinkCategory(group.category)),
    [groupedItems],
  )

  const normalizedPayload = useMemo(() => normalizeMenuPayload(form), [form])
  const pendingUpdates = useMemo(
    () => (editingId ? getChangedMenuFields(normalizedPayload, editingItem) : normalizedPayload),
    [editingId, editingItem, normalizedPayload],
  )
  const hasPendingChanges = !editingId || Object.keys(pendingUpdates).length > 0

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setEditingItem(item)
    setForm({
      name: item.name || '',
      category: item.category || '',
      price: String(item.price ?? ''),
      description: item.description || '',
      image: item.image || '',
    })
  }

  const resetForm = () => {
    setEditingId('')
    setEditingItem(null)
    setForm(initialForm)
  }

  const closeEditModal = () => {
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      const payload = normalizedPayload

      if (editingId) {
        if (!Object.keys(pendingUpdates).length) {
          showToast({
            tone: 'info',
            title: 'No changes to save',
            message: 'Update at least one field before saving this menu item.',
          })
          return
        }

        const updated = await updateAdminMenuItem(editingId, pendingUpdates)
        setMenuItems((current) => current.map((item) => (item._id === editingId ? updated : item)))
        showToast({
          tone: 'success',
          title: 'Menu item updated',
          message: `${updated.name} was updated successfully.`,
        })
      } else {
        const created = await createAdminMenuItem(payload)
        setMenuItems((current) => [created, ...current])
        showToast({
          tone: 'success',
          title: 'Menu item added',
          message: `${created.name} was added to the menu.`,
        })
      }

      resetForm()
    } catch (err) {
      setError(err.message)
      showToast({
        tone: 'error',
        title: 'Menu save failed',
        message: err.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    try {
      setDeletingId(item._id)
      setError('')
      await deleteAdminMenuItem(item._id)
      setMenuItems((current) => current.filter((entry) => entry._id !== item._id))
      if (editingId === item._id) {
        resetForm()
      }
      showToast({
        tone: 'success',
        title: 'Menu item deleted',
        message: `${item.name} was removed from the menu.`,
      })
    } catch (err) {
      setError(err.message)
      showToast({
        tone: 'error',
        title: 'Delete failed',
        message: err.message,
      })
    } finally {
      setDeletingId('')
      setConfirmDeleteItem(null)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setUploadingImage(true)
      setError('')
      const imageUrl = await uploadMenuImage(file)
      setForm((current) => ({ ...current, image: imageUrl }))
      showToast({
        tone: 'success',
        title: 'Image uploaded',
        message: 'Cloudinary image uploaded successfully.',
      })
    } catch (err) {
      setError(err.message)
      showToast({
        tone: 'error',
        title: 'Upload failed',
        message: err.message,
      })
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const jumpToCategory = (category, type) => {
    if (type === 'food') {
      setActiveFoodJumpCategory(category)
    } else {
      setActiveDrinkJumpCategory(category)
    }

    if (category === 'All') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const section = sectionRefs.current[category]
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const foodJumpCategories = useMemo(
    () => ['All', ...foodGroups.map((group) => group.category)],
    [foodGroups],
  )

  const drinkJumpCategories = useMemo(
    () => ['All', ...drinkGroups.map((group) => group.category)],
    [drinkGroups],
  )

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Admin Menu"
          title="Manage food and drinks items"
          description="Add, edit, and organize the customer menu across both food and drinks sections."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => loadMenu({ silent: true })}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:bg-surface-strong"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh menu
          </button>
        </div>
      </section>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <section className="mt-6">
        <div className="glass-panel rounded-[30px] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                New Item
              </p>
              <h2 className="mt-3 font-display text-3xl">Add a new menu item</h2>
            </div>
          </div>

          <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Food name" value={form.name} onChange={(value) => handleChange('name', value)} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <Field label="Category" value={form.category} onChange={(value) => handleChange('category', value)} listId="menu-category-options" />
              <Field
                label="Price (AUD)"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(value) => handleChange('price', value)}
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={4}
                className="w-full rounded-[22px] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                required
              />
            </label>
            <Field
              label="Image URL"
              type="url"
              required={false}
              value={form.image}
              onChange={(value) => handleChange('image', value)}
              placeholder="Optional for now. You can add it later."
            />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Upload image</span>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[22px] border border-dashed border-border bg-surface-strong px-4 py-4 text-sm font-semibold transition hover:bg-bg-strong">
                {uploadingImage ? <RefreshCw size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadingImage ? 'Uploading to Cloudinary...' : 'Choose file and upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </label>

            {form.image ? (
              <div className="rounded-[22px] border border-border bg-surface-strong p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                  Uploaded image
                </p>
                <img
                  src={getCloudinaryImageUrl(form.image, {
                    width: 960,
                    height: 720,
                    crop: 'fill',
                  })}
                  alt="Menu preview"
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full rounded-[18px] object-cover"
                />
              </div>
            ) : null}

            <datalist id="menu-category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-primary px-5 py-4 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
            >
              <Plus size={16} />
              {submitting ? 'Saving...' : 'Add item'}
            </button>
          </form>
        </div>

        <div className="mt-6 glass-panel rounded-[30px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Full Menu
              </p>
              <h2 className="mt-3 font-display text-3xl">All menu items</h2>
            </div>
            <span className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted">
              {menuItems.length} items
            </span>
          </div>

          {!loading && foodGroups.length ? (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Jump Through Food Menu
              </p>
              <CategoryTabs
                categories={foodJumpCategories}
                activeCategory={activeFoodJumpCategory}
                onChange={(category) => jumpToCategory(category, 'food')}
              />
            </div>
          ) : null}

          {!loading && drinkGroups.length ? (
            <div className="mt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Jump Through Drinks Menu
              </p>
              <CategoryTabs
                categories={drinkJumpCategories}
                activeCategory={activeDrinkJumpCategory}
                onChange={(category) => jumpToCategory(category, 'drink')}
              />
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-[24px] bg-surface-strong" />
              ))}
            </div>
          ) : !groupedItems.length ? (
            <div className="mt-6 rounded-[24px] border border-border bg-surface-strong p-6 text-center">
              <h3 className="font-display text-2xl">No menu items yet</h3>
              <p className="mt-3 text-sm text-muted">Create your first item from the form.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {[
                ['Food Menu', foodGroups],
                ['Drinks Menu', drinkGroups],
              ].map(([sectionTitle, groups]) =>
                groups.length ? (
                  <div key={sectionTitle} className="space-y-5">
                    <div className="rounded-[24px] border border-border bg-surface-strong px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                        {sectionTitle}
                      </p>
                    </div>
                    {groups.map(({ category, items }) => (
                      <div
                        key={category}
                        ref={(element) => {
                          sectionRefs.current[category] = element
                        }}
                      >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                          {category}
                        </p>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {items.map((item) => (
                            <article
                              key={item._id}
                              className="flex h-full flex-col rounded-[24px] border border-border bg-surface-strong p-4"
                            >
                              {item.image ? (
                                <img
                                  src={getCloudinaryImageUrl(item.image, {
                                    width: 720,
                                    height: 480,
                                    crop: 'fill',
                                  })}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="mb-4 h-40 w-full rounded-[18px] object-cover"
                                />
                              ) : null}
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
                                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                  {currency(item.price)}
                                </span>
                              </div>
                              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.description}</p>
                              <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(item)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-surface"
                                  >
                                    <Pencil size={15} />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteItem(item)}
                                    disabled={deletingId === item._id}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-text px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 size={15} />
                                    {deletingId === item._id ? 'Deleting...' : 'Delete'}
                                  </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      </section>

      {confirmDeleteItem
        ? createPortal(
            <div className="fixed inset-0 z-[100] bg-black/45">
              <div className="flex min-h-screen items-start justify-center px-4 pb-6 pt-24 sm:items-center sm:pt-6">
                <div className="glass-panel w-full max-w-md rounded-[28px] p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                    Confirm Delete
                  </p>
                  <h2 className="mt-4 font-display text-3xl">Remove this menu item?</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    "{confirmDeleteItem.name}" will be removed from the menu list. You can sync it back later, but this action will remove it now.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteItem(null)}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-surface-strong"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(confirmDeleteItem)}
                      disabled={deletingId === confirmDeleteItem._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === confirmDeleteItem._id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      {deletingId === confirmDeleteItem._id ? 'Deleting...' : 'Delete item'}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {editingId
        ? createPortal(
            <div className="fixed inset-0 z-[110] bg-black/50">
              <div className="flex min-h-screen items-start justify-center px-4 pb-6 pt-10 sm:items-center sm:pt-6">
                <div className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] p-6 shadow-soft">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                        Edit Item
                      </p>
                      <h2 className="mt-3 font-display text-3xl">Update menu item</h2>
                      <p className="mt-3 text-sm text-muted">
                        Edit any field here and save changes without losing your position in the menu list.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition hover:bg-surface-strong"
                      aria-label="Close edit modal"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
                    <Field label="Food name" value={form.name} onChange={(value) => handleChange('name', value)} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                      <Field label="Category" value={form.category} onChange={(value) => handleChange('category', value)} listId="menu-category-options" />
                      <Field
                        label="Price (AUD)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(value) => handleChange('price', value)}
                      />
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">Description</span>
                      <textarea
                        value={form.description}
                        onChange={(event) => handleChange('description', event.target.value)}
                        rows={4}
                        className="w-full rounded-[22px] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
                        required
                      />
                    </label>
                    <Field
                      label="Image URL"
                      type="url"
                      required={false}
                      value={form.image}
                      onChange={(value) => handleChange('image', value)}
                      placeholder="Optional for now. You can add it later."
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">Upload image</span>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[22px] border border-dashed border-border bg-surface-strong px-4 py-4 text-sm font-semibold transition hover:bg-bg-strong">
                        {uploadingImage ? <RefreshCw size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        {uploadingImage ? 'Uploading to Cloudinary...' : 'Choose file and upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </label>

                    {form.image ? (
                      <div className="rounded-[22px] border border-border bg-surface-strong p-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                          Uploaded image
                        </p>
                        <img
                          src={getCloudinaryImageUrl(form.image, {
                            width: 960,
                            height: 720,
                            crop: 'fill',
                          })}
                          alt="Menu preview"
                          loading="lazy"
                          decoding="async"
                          className="h-48 w-full rounded-[18px] object-cover"
                        />
                      </div>
                    ) : null}

                    <datalist id="menu-category-options">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>

                    <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="inline-flex flex-1 items-center justify-center rounded-[22px] border border-border px-5 py-4 text-sm font-semibold transition hover:bg-surface-strong"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !hasPendingChanges}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-[22px] bg-primary px-5 py-4 text-sm font-semibold text-bg-strong transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />
                        {submitting ? 'Saving...' : hasPendingChanges ? 'Update item' : 'No changes yet'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </AppShell>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder = '',
  listId,
  ...rest
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        list={listId}
        className="w-full rounded-[22px] border border-border bg-transparent px-4 py-3 outline-none transition focus:border-primary"
        {...rest}
      />
    </label>
  )
}

export default AdminMenuManager
