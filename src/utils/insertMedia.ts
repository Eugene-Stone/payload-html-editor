// htmlEditor/utils/insertMedia.ts
import type { Editor } from '@tiptap/react'

import { buildSrcSet } from './buildSrcSet'

export type MediaDocument = {
	id: number | string
	url: string
	filename?: string | null
	alt?: string | null
	width?: number | null
	height?: number | null
	sizes?: Record<
		string,
		{
			url?: string
			width?: number
			height?: number
		}
	>
}

export function isMediaDocument(value: unknown): value is MediaDocument {
	if (!value || typeof value !== 'object') return false

	const media = value as Partial<MediaDocument>
	const hasValidID =
		(typeof media.id === 'string' && media.id.length > 0) ||
		(typeof media.id === 'number' && Number.isFinite(media.id))

	return hasValidID && typeof media.url === 'string' && media.url.length > 0
}

export function getMediaAlt(media: MediaDocument, fallbackAlt = '') {
	return media.alt?.trim() || fallbackAlt.trim() || media.filename?.replace(/\.[^/.]+$/, '') || ''
}

export function mediaToImageNode(media: MediaDocument, fallbackAlt = '') {
	const srcset = buildSrcSet(media)

	return {
		type: 'image',
		attrs: {
			src: media.url,
			alt: getMediaAlt(media, fallbackAlt),
			srcset,
			sizes: srcset ? '100vw' : null,
			width: media.width || null,
			height: media.height || null,
			loading: 'lazy',
			mediaId: media.id,
		},
	}
}

export function insertMedia(editor: Editor, media: MediaDocument, fallbackAlt = '') {
	editor.chain().focus().insertContent(mediaToImageNode(media, fallbackAlt)).run()
}
