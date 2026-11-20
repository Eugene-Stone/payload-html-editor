'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FieldLabel, useField } from '@payloadcms/ui'

import { EditorContent, useEditor, type Editor } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TableKit } from '@tiptap/extension-table'
import FileHandler from '@tiptap/extension-file-handler'

import { MediaImage } from '../extensions/MediaImage'
import { mediaToImageNode } from '../utils/insertMedia'
import {
	defaultAllowedImageMimeTypes,
	uploadMedia,
	type UploadMediaOptions,
} from '../utils/uploadMedia'
import type { HtmlEditorFeatureOptions } from '../field'

import { Toolbar } from './Toolbar'
import { HtmlSourceModal } from './HtmlSourceModal'

import './HtmlEditor.css'

type Props = {
	path: string
	field?: {
		admin?: {
			custom?: {
				htmlEditor?: {
					features?: HtmlEditorFeatureOptions
					maxUploadSize?: number
					mediaCollection?: string
				}
			}
		}
		label?: string
		name?: string
		required?: boolean
	}
}

const defaultFeatures: Required<HtmlEditorFeatureOptions> = {
	images: true,
	sourceEditing: true,
	tables: true,
	textAlignment: true,
}

export default function HtmlEditor({ path, field }: Props) {
	const { value, setValue } = useField<string>({ path })
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [toolbarIsSticky, setToolbarIsSticky] = useState(false)
	const editorContainerRef = useRef<HTMLDivElement>(null)

	const customOptions = field?.admin?.custom?.htmlEditor
	const features = useMemo(
		() => ({
			...defaultFeatures,
			...customOptions?.features,
		}),
		[customOptions?.features],
	)
	const uploadOptions: UploadMediaOptions = useMemo(
		() => ({
			allowedMimeTypes: defaultAllowedImageMimeTypes,
			maxUploadSize: customOptions?.maxUploadSize,
			mediaCollection: customOptions?.mediaCollection || 'media',
		}),
		[customOptions?.maxUploadSize, customOptions?.mediaCollection],
	)

	const uploadAndInsertImage = useCallback(
		async (editor: Editor, file: File, pos?: number) => {
			setUploading(true)
			setError(null)

			try {
				const media = await uploadMedia(file, uploadOptions)
				const node = mediaToImageNode(media, file.name.replace(/\.[^/.]+$/, ''))
				const chain = editor.chain().focus()

				if (typeof pos === 'number') {
					chain.insertContentAt(pos, node).run()
				} else {
					chain.insertContent(node).run()
				}
			} catch (uploadError) {
				const message = uploadError instanceof Error ? uploadError.message : 'Image upload failed.'

				setError(message)
				console.error('Image upload failed:', uploadError)
			} finally {
				setUploading(false)
			}
		},
		[uploadOptions],
	)

	const extensions = useMemo(
		() => [
			StarterKit.configure({
				link: {
					openOnClick: false,
				},
			}),
			...(features.textAlignment
				? [
						TextAlign.configure({
							types: ['heading', 'paragraph'],
						}),
					]
				: []),
			...(features.tables
				? [
						TableKit.configure({
							table: {
								resizable: true,
							},
						}),
					]
				: []),
			...(features.images
				? [
						MediaImage,
						FileHandler.configure({
							allowedMimeTypes: defaultAllowedImageMimeTypes,

							onDrop: async (editor, files, pos) => {
								for (const file of files) {
									await uploadAndInsertImage(editor, file, pos)
								}
							},

							onPaste: async (editor, files) => {
								for (const file of files) {
									await uploadAndInsertImage(editor, file)
								}
							},
						}),
					]
				: []),
		],
		[features.images, features.tables, features.textAlignment, uploadAndInsertImage],
	)

	const editor = useEditor({
		immediatelyRender: false,

		extensions,

		content: value || '',

		onUpdate({ editor }) {
			setValue(editor.getHTML())
		},
	})

	useEffect(() => {
		if (!editor) return

		if (value !== editor.getHTML()) {
			editor.commands.setContent(value || '', {
				emitUpdate: false,
			})
		}
	}, [editor, value])

	useEffect(() => {
		const updateToolbarStickyState = () => {
			const container = editorContainerRef.current
			const toolbar = container?.querySelector<HTMLElement>('.html-editor-toolbar')

			if (!container || !toolbar) {
				setToolbarIsSticky(false)
				return
			}

			const stickyTop = Number.parseFloat(window.getComputedStyle(toolbar).top)
			const toolbarRect = toolbar.getBoundingClientRect()
			const containerRect = container.getBoundingClientRect()

			setToolbarIsSticky(
				toolbarRect.top <= stickyTop && containerRect.bottom > toolbarRect.bottom,
			)
		}

		window.addEventListener('scroll', updateToolbarStickyState, true)
		window.addEventListener('resize', updateToolbarStickyState)
		updateToolbarStickyState()

		return () => {
			window.removeEventListener('scroll', updateToolbarStickyState, true)
			window.removeEventListener('resize', updateToolbarStickyState)
		}
	}, [editor])

	if (!editor) {
		return null
	}

	return (
		<div
			ref={editorContainerRef}
			className={`payload-html-editor${toolbarIsSticky ? ' toolbar-is-sticky' : ''}`}
		>
			<FieldLabel label={field?.label || field?.name} path={path} required={field?.required} />

			<Toolbar
				editor={editor}
				features={features}
				onError={setError}
				onUploadingChange={setUploading}
				uploadOptions={uploadOptions}
			/>

			{error && <div className="html-editor-error">{error}</div>}
			{uploading && <div className="html-editor-status">Uploading image...</div>}

			<EditorContent
				editor={editor}
				onClick={(event) => {
					if (event.target instanceof Element && event.target.closest('a')) {
						event.preventDefault()
					}
				}}
			/>

			{features.sourceEditing && <HtmlSourceModal editor={editor} />}
		</div>
	)
}
