// htmlEditor/extensions/MediaImage.ts
import Image from '@tiptap/extension-image'
import { mergeAttributes } from '@tiptap/core'

export const MediaImage = Image.extend({
	name: 'image',

	addAttributes() {
		return {
			...this.parent?.(),

			srcset: {
				default: null,
			},

			sizes: {
				default: '100vw',
			},

			loading: {
				default: 'lazy',
			},

			mediaId: {
				default: null,
			},
		}
	},

	renderHTML({ HTMLAttributes }) {
		return ['img', mergeAttributes(HTMLAttributes)]
	},
})
