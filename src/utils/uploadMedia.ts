// htmlEditor/utils/uploadMedia.ts
import { isMediaDocument, type MediaDocument } from './insertMedia'

export type UploadMediaOptions = {
	allowedMimeTypes?: string[]
	maxUploadSize?: number
	mediaCollection?: string
}

export const defaultAllowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function getUploadErrorMessage(status: number) {
	if (status === 401 || status === 403) return 'You do not have permission to upload media.'
	if (status === 413) return 'The selected file is too large.'

	return `Media upload failed with status ${status}.`
}

export async function uploadMedia(
	file: File,
	{
		allowedMimeTypes = defaultAllowedImageMimeTypes,
		maxUploadSize = 10 * 1024 * 1024,
		mediaCollection = 'media',
	}: UploadMediaOptions = {},
): Promise<MediaDocument> {
	if (!allowedMimeTypes.includes(file.type)) {
		throw new Error(`Unsupported image type: ${file.type || 'unknown'}.`)
	}

	if (file.size > maxUploadSize) {
		throw new Error(
			`Image is too large. Maximum size is ${Math.round(maxUploadSize / 1024 / 1024)} MB.`,
		)
	}

	const formData = new FormData()

	formData.append('file', file)

	const response = await fetch(`/api/${encodeURIComponent(mediaCollection)}`, {
		method: 'POST',
		body: formData,
		credentials: 'include',
	})

	if (!response.ok) {
		throw new Error(getUploadErrorMessage(response.status))
	}

	const result: unknown = await response.json()
	const doc =
		result && typeof result === 'object' && 'doc' in result
			? (result as { doc: unknown }).doc
			: null

	if (!isMediaDocument(doc)) {
		throw new Error('Payload returned an invalid media document.')
	}

	return doc
}
