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

			linkHref: {
				default: null,
				parseHTML: (element) => element.closest('a')?.getAttribute('href'),
				renderHTML: () => ({}),
			},
		}
	},

	renderHTML({ node, HTMLAttributes }) {
		const linkHref = node.attrs.linkHref
		const image = ['img', mergeAttributes(HTMLAttributes)] as const

		return linkHref ? ['a', { href: linkHref }, image] : image
	},
})
