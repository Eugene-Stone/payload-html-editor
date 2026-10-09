// htmlEditor/utils/buildSrcSet.ts
type MediaSize = {
	url?: string
	width?: number
}

type Media = {
	url?: string
	sizes?: Record<string, MediaSize>
}

export function buildSrcSet(media: Media) {
	if (!media.sizes) return undefined

	const srcset = Object.values(media.sizes)
		.filter(
			(size): size is MediaSize & { url: string; width: number } =>
				typeof size.url === 'string' &&
				size.url.length > 0 &&
				typeof size.width === 'number' &&
				Number.isFinite(size.width) &&
				size.width > 0,
		)
		.map((size) => `${size.url} ${size.width}w`)
		.join(', ')

	return srcset || undefined
}
