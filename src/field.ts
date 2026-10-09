// htmlEditor/field.ts
import type { TextareaField } from 'payload'

export type HtmlEditorFeatureOptions = {
	images?: boolean
	sourceEditing?: boolean
	tables?: boolean
	textAlignment?: boolean
}

export type HtmlEditorFieldOptions = {
	admin?: TextareaField['admin']
	componentPath?: string
	features?: HtmlEditorFeatureOptions
	label?: string
	maxUploadSize?: number
	mediaCollection?: string
	name: string
	required?: boolean
}

const defaultFeatures: Required<HtmlEditorFeatureOptions> = {
	images: true,
	sourceEditing: true,
	tables: true,
	textAlignment: true,
}

export const htmlEditorField = ({
	admin,
	componentPath = 'payload-html-editor/client#HtmlEditor',
	features,
	label,
	maxUploadSize,
	mediaCollection,
	name,
	required,
}: HtmlEditorFieldOptions): TextareaField => ({
	name,
	type: 'textarea',
	label: label || name,
	required,

	admin: {
		...admin,
		components: {
			...admin?.components,
			Field: componentPath,
		},
		custom: {
			...admin?.custom,
			htmlEditor: {
				features: {
					...defaultFeatures,
					...features,
				},
				maxUploadSize,
				mediaCollection,
			},
		},
	},
})
