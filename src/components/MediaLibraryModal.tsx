'use client'

import { useEffect, useState } from 'react'

import { isMediaDocument, type MediaDocument } from '../utils/insertMedia'

type Props = {
	mediaCollection: string
	open: boolean
	onClose: () => void
	onSelect: (media: MediaDocument) => void
}

export function MediaLibraryModal({ mediaCollection, open, onClose, onSelect }: Props) {
	const [media, setMedia] = useState<MediaDocument[]>([])
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return

		const controller = new AbortController()

		const loadMedia = async () => {
			setLoading(true)
			setError(null)

			try {
				const params = new URLSearchParams()

				params.set('limit', '24')
				params.set('page', String(page))
				params.set('sort', '-createdAt')

				if (search.trim()) {
					params.set('where[alt][contains]', search.trim())
				}

				const response = await fetch(`/api/${encodeURIComponent(mediaCollection)}?${params.toString()}`, {
					credentials: 'include',
					signal: controller.signal,
				})

				if (!response.ok) {
					throw new Error(`Media request failed: ${response.status}`)
				}

				const data: unknown = await response.json()

				if (
					!data ||
					typeof data !== 'object' ||
					!('docs' in data) ||
					!Array.isArray(data.docs) ||
					!data.docs.every(isMediaDocument)
				) {
					throw new Error('Payload returned an invalid media list.')
				}

				setMedia(data.docs)
			} catch (error) {
				if (controller.signal.aborted) return

				setError(error instanceof Error ? error.message : 'Failed to load media.')
				console.error('Failed to load media:', error)
			} finally {
				if (!controller.signal.aborted) setLoading(false)
			}
		}

		void loadMedia()

		return () => controller.abort()
	}, [mediaCollection, open, page, search])

	if (!open) {
		return null
	}

	return (
		<div
			className="media-library-overlay"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose()
				}
			}}
		>
			<div className="media-library-modal">
				<div className="media-library-header">
					<h2>Media library</h2>

					<button type="button" className="media-library-close" onClick={onClose}>
						×
					</button>
				</div>

				<div className="media-library-search">
					<input
						type="text"
						value={search}
						placeholder="Search images..."
						onChange={(event) => {
							setPage(1)
							setSearch(event.target.value)
						}}
					/>
				</div>

				<div className="media-library-content">
					{loading && <div className="media-library-loading">Loading...</div>}

					{error && (
						<div className="html-editor-error" role="alert">
							{error}
						</div>
					)}

					{!loading && !error && media.length === 0 && (
						<div className="media-library-empty">No images found</div>
					)}

					{!loading && !error && media.length > 0 && (
						<div className="media-library-grid">
							{media.map((item) => (
								<button
									key={item.id}
									type="button"
									className="media-library-item"
									onClick={() => {
										onSelect(item)
										onClose()
									}}
								>
									<img src={item.sizes?.small?.url || item.url} alt={item.alt || ''} />

									<span>{item.alt || `Image #${item.id}`}</span>
								</button>
							))}
						</div>
					)}
				</div>

				<div className="media-library-footer">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((current) => Math.max(1, current - 1))}
					>
						← Previous
					</button>

					<span>Page {page}</span>

					<button
						type="button"
						disabled={media.length < 24}
						onClick={() => setPage((current) => current + 1)}
					>
						Next →
					</button>
				</div>
			</div>
		</div>
	)
}
