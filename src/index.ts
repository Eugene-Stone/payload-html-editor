// htmlEditor/index.ts
import type { Config, Field } from 'payload'

export type HtmlEditorPluginOptions = {
	mediaCollection?: string
}

export const htmlEditorPlugin =
	(options: HtmlEditorPluginOptions = {}) =>
	(config: Config): Config => {
		const mediaCollection = options.mediaCollection || 'media'

		return {
			...config,
			admin: {
				...config.admin,
				custom: {
					...config.admin?.custom,
					htmlEditor: {
						mediaCollection,
					},
				},
			},
			collections: config.collections?.map((collection) => ({
				...collection,
				fields: applyPluginDefaults(collection.fields, mediaCollection),
			})),
			globals: config.globals?.map((global) => ({
				...global,
				fields: applyPluginDefaults(global.fields, mediaCollection),
			})),
		}
	}

export { htmlEditorField } from './field'
export type { HtmlEditorFeatureOptions, HtmlEditorFieldOptions } from './field'

type FieldLike = {
	admin?: {
		custom?: {
			htmlEditor?: {
				mediaCollection?: string
			}
		}
	}
	fields?: FieldLike[]
	tabs?: Array<{ fields?: FieldLike[] }>
	blocks?: Array<{ fields?: FieldLike[] }>
}

function applyPluginDefaults(fields: Field[], mediaCollection: string): Field[] {
	return fields.map((field) => {
		const fieldLike = field as FieldLike
		const htmlEditor = fieldLike.admin?.custom?.htmlEditor
		const nextField: FieldLike = {
			...(field as object),
		}

		if (htmlEditor && !htmlEditor.mediaCollection) {
			nextField.admin = {
				...fieldLike.admin,
				custom: {
					...fieldLike.admin?.custom,
					htmlEditor: {
						...htmlEditor,
						mediaCollection,
					},
				},
			}
		}

		if (fieldLike.fields) {
			nextField.fields = applyPluginDefaults(
				fieldLike.fields as Field[],
				mediaCollection,
			) as FieldLike[]
		}

		if (fieldLike.tabs) {
			nextField.tabs = fieldLike.tabs.map((tab) => ({
				...tab,
				fields: tab.fields
					? (applyPluginDefaults(tab.fields as Field[], mediaCollection) as FieldLike[])
					: tab.fields,
			}))
		}

		if (fieldLike.blocks) {
			nextField.blocks = fieldLike.blocks.map((block) => ({
				...block,
				fields: block.fields
					? (applyPluginDefaults(block.fields as Field[], mediaCollection) as FieldLike[])
					: block.fields,
			}))
		}

		return nextField as Field
	})
}

export { buildSrcSet } from './utils/buildSrcSet'
export { insertMedia, isMediaDocument, mediaToImageNode } from './utils/insertMedia'
export type { MediaDocument } from './utils/insertMedia'
