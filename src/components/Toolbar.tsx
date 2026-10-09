// htmlEditor/components/Toolbar.tsx
'use client'

import type { Editor } from '@tiptap/react'

import { useRef, useState } from 'react'

import { uploadMedia } from '../utils/uploadMedia'
import { insertMedia } from '../utils/insertMedia'
import type { HtmlEditorFeatureOptions } from '../field'
import type { UploadMediaOptions } from '../utils/uploadMedia'

import { MediaLibraryModal } from './MediaLibraryModal'
import { useEditorState } from '@tiptap/react'

type Props = {
	editor: Editor
	features: Required<HtmlEditorFeatureOptions>
	onError: (message: string | null) => void
	onUploadingChange: (uploading: boolean) => void
	uploadOptions: UploadMediaOptions
}

export function Toolbar({ editor, features, onError, onUploadingChange, uploadOptions }: Props) {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)

	// const isTableActive = editor.isActive('table')

	const editorState = useEditorState({
		editor,
		selector: ({ editor }) => ({
			headingLevel: editor.isActive('heading')
				? String(editor.getAttributes('heading').level)
				: 'paragraph',

			isBlockquote: editor.isActive('blockquote'),
			isBold: editor.isActive('bold'),
			isBulletList: editor.isActive('bulletList'),
			isItalic: editor.isActive('italic'),
			isLink: editor.isActive('link'),
			isOrderedList: editor.isActive('orderedList'),
			isStrike: editor.isActive('strike'),
			isTableActive: editor.isActive('table'),
			isUnderline: editor.isActive('underline'),

			isTextAlignCenter: editor.isActive({ textAlign: 'center' }),
			isTextAlignJustify: editor.isActive({ textAlign: 'justify' }),
			isTextAlignLeft: editor.isActive({ textAlign: 'left' }),
			isTextAlignRight: editor.isActive({ textAlign: 'right' }),
			textAlign: editor.isActive({ textAlign: 'center' })
				? 'center'
				: editor.isActive({ textAlign: 'right' })
					? 'right'
					: editor.isActive({ textAlign: 'justify' })
						? 'justify'
						: 'left',

			isImageActive: editor.isActive('image'),
			imageAlt: editor.isActive('image') ? (editor.getAttributes('image').alt as string) || '' : '',
		}),
	})

	return (
		<>
			<div className="html-editor-toolbar">
				{/* ========================= Undo / Redo ========================= */}

				<button
					type="button"
					disabled={!editor.can().undo()}
					onClick={() => editor.chain().focus().undo().run()}
				>
					<svg viewBox="0 0 20 20">
						<path d="m5.042 9.367 2.189 1.837a.75.75 0 0 1 -.965 1.149l-3.788-3.18a.75.75 0 0 1 -.21-.284.75.75 0 0 1 .17-.945l3.792-3.182a.75.75 0 1 1 .964 1.15l-2.331 1.954h8.917a.8.8 0 0 1 .22.034 4 4 0 1 1 -1.477 7.718l.344-1.489a2.5 2.5 0 1 0 1.094-4.73l.008-.032z" />
					</svg>
				</button>

				<button
					type="button"
					disabled={!editor.can().redo()}
					onClick={() => editor.chain().focus().redo().run()}
				>
					<svg viewBox="0 0 20 20">
						<path d="m14.958 9.367-2.189 1.837a.75.75 0 0 0 .965 1.149l3.788-3.18a.75.75 0 0 0 .21-.284.75.75 0 0 0 -.17-.945l-3.792-3.182a.75.75 0 1 0 -.964 1.15l2.331 1.955h-8.917a.8.8 0 0 0 -.22.033 4 4 0 1 0 1.477 7.718l-.344-1.489a2.5 2.5 0 1 1 -1.094-4.729l-.008-.032z" />
					</svg>
				</button>

				<span className="separator" />

				{/* ========================= Heading ========================= */}

				<select
					aria-label="Text style"
					value={editorState.headingLevel}
					onChange={(event) => {
						const value = event.target.value

						if (value === 'paragraph') {
							editor.chain().focus().setParagraph().run()

							return
						}

						editor
							.chain()
							.focus()
							.setHeading({
								level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6,
							})
							.run()
					}}
				>
					<option value="paragraph">Paragraph</option>

					<option value="1">Heading 1</option>
					<option value="2">Heading 2</option>
					<option value="3">Heading 3</option>
					<option value="4">Heading 4</option>
					<option value="5">Heading 5</option>
					<option value="6">Heading 6</option>
				</select>

				<span className="separator" />

				{/* ========================= Alignment ========================= */}
				{features.textAlignment && (
					<>
						{/* <button
							type="button"
							aria-label="Align left"
							className={editorState.isTextAlignLeft ? 'active' : ''}
							onClick={() => editor.chain().focus().setTextAlign('left').run()}
						>
							<svg viewBox="0 0 20 20">
								<path d="m2 3.75c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m0 8c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m0 4c0 .414.336.75.75.75h9.929a.75.75 0 1 0 0-1.5h-9.929a.75.75 0 0 0 -.75.75m0-8c0 .414.336.75.75.75h9.929a.75.75 0 1 0 0-1.5h-9.929a.75.75 0 0 0 -.75.75" />
							</svg>
						</button>

						<button
							type="button"
							aria-label="Align right"
							className={editorState.isTextAlignRight ? 'active' : ''}
							onClick={() => editor.chain().focus().setTextAlign('right').run()}
						>
							<svg viewBox="0 0 20 20">
								<path d="m18 3.75a.75.75 0 0 1 -.75.75h-14.5a.75.75 0 1 1 0-1.5h14.5a.75.75 0 0 1 .75.75m0 8a.75.75 0 0 1 -.75.75h-14.5a.75.75 0 1 1 0-1.5h14.5a.75.75 0 0 1 .75.75m0 4a.75.75 0 0 1 -.75.75h-9.929a.75.75 0 1 1 0-1.5h9.929a.75.75 0 0 1 .75.75m0-8a.75.75 0 0 1 -.75.75h-9.929a.75.75 0 1 1 0-1.5h9.929a.75.75 0 0 1 .75.75" />
							</svg>
						</button>

						<button
							type="button"
							aria-label="Align center"
							className={editorState.isTextAlignCenter ? 'active' : ''}
							onClick={() => editor.chain().focus().setTextAlign('center').run()}
						>
							<svg viewBox="0 0 20 20">
								<path d="m2 3.75c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m0 8c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m2.286 4c0 .414.336.75.75.75h9.928a.75.75 0 1 0 0-1.5h-9.928a.75.75 0 0 0 -.75.75m0-8c0 .414.336.75.75.75h9.928a.75.75 0 1 0 0-1.5h-9.928a.75.75 0 0 0 -.75.75" />
							</svg>
						</button>

						<button
							type="button"
							aria-label="Justify"
							className={editorState.isTextAlignJustify ? 'active' : ''}
							onClick={() => editor.chain().focus().setTextAlign('justify').run()}
						>
							<svg viewBox="0 0 20 20">
								<path d="m2 3.75c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m0 8c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75m0 4c0 .414.336.75.75.75h9.929a.75.75 0 1 0 0-1.5h-9.929a.75.75 0 0 0 -.75.75m0-8c0 .414.336.75.75.75h14.5a.75.75 0 1 0 0-1.5h-14.5a.75.75 0 0 0 -.75.75" />
							</svg>
						</button> */}

						<select
							style={{ paddingRight: 0 }}
							aria-label="Text alignment"
							value={editorState.textAlign}
							onChange={(event) => {
								const value = event.target.value

								if (value === 'left') {
									editor.chain().focus().unsetTextAlign().run()

									return
								}

								editor.chain().focus().setTextAlign(value).run()
							}}
						>
							<option value="left">Align left</option>
							<option value="center">Align center</option>
							<option value="right">Align right</option>
							<option value="justify">Justify</option>
						</select>
					</>
				)}

				<span className="separator" />

				{/* ========================= Formatting ========================= */}
				<button
					type="button"
					aria-label="Bold"
					className={editorState.isBold ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<strong>B</strong>
				</button>

				<button
					type="button"
					aria-label="Italic"
					className={editorState.isItalic ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<em>I</em>
				</button>

				<button
					type="button"
					aria-label="Underline"
					className={editorState.isUnderline ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleUnderline().run()}
				>
					<u>U</u>
				</button>

				<button
					type="button"
					aria-label="Strikethrough"
					className={editorState.isStrike ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleStrike().run()}
				>
					<s>S</s>
				</button>

				<span className="separator" />

				{/* ========================= Link ========================= */}
				<button
					type="button"
					className={editorState.isLink ? 'active' : ''}
					onClick={() => {
						const url = window.prompt('URL', editor.getAttributes('link').href || '')

						if (url === null) return

						if (url === '') {
							editor.chain().focus().unsetLink().run()

							return
						}

						editor
							.chain()
							.focus()
							.setLink({
								href: url,
							})
							.run()
					}}
				>
					<svg viewBox="0 0 20 20">
						<path d="m11.077 15 .991-1.416a.75.75 0 1 1 1.229.86l-1.148 1.64a.8.8 0 0 1 -.217.206 5.251 5.251 0 0 1 -8.503-5.955.7.7 0 0 1 .12-.274l1.147-1.639a.75.75 0 1 1 1.228.86l-.991 1.418.006.003a3.75 3.75 0 0 0 6.132 4.294zm5.494-5.335a.8.8 0 0 1 -.12.274l-1.147 1.639a.75.75 0 1 1 -1.228-.86l.86-1.23a3.75 3.75 0 0 0 -6.144-4.301l-.86 1.229a.75.75 0 0 1 -1.229-.86l1.148-1.64a.8.8 0 0 1 .217-.206 5.251 5.251 0 0 1 8.503 5.955m-4.563-2.532a.75.75 0 0 1 .184 1.045l-3.155 4.505a.75.75 0 1 1 -1.229-.86l3.155-4.506a.75.75 0 0 1 1.045-.184" />
					</svg>
				</button>

				{/* ========================= Lists ========================= */}

				<button
					type="button"
					className={editorState.isBulletList ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<svg viewBox="0 0 20 20">
						<path d="m7 5.75c0 .414.336.75.75.75h9.5a.75.75 0 1 0 0-1.5h-9.5a.75.75 0 0 0 -.75.75m-6 0c0-.966.777-1.75 1.75-1.75.966 0 1.75.777 1.75 1.75 0 .966-.777 1.75-1.75 1.75-.966 0-1.75-.777-1.75-1.75m6 9c0 .414.336.75.75.75h9.5a.75.75 0 1 0 0-1.5h-9.5a.75.75 0 0 0 -.75.75m-6 0c0-.966.777-1.75 1.75-1.75.966 0 1.75.777 1.75 1.75 0 .966-.777 1.75-1.75 1.75-.966 0-1.75-.777-1.75-1.75" />
					</svg>
				</button>

				<button
					type="button"
					className={editorState.isOrderedList ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<svg viewBox="0 0 20 20">
						<path d="m7 5.75c0 .414.336.75.75.75h9.5a.75.75 0 1 0 0-1.5h-9.5a.75.75 0 0 0 -.75.75m-3.5-2.75v5h-1.5v-4.3h-1v-1h2.5zm-3.157 14.857 2.59-3.257h-.013a.6.6 0 1 0 -1.04 0h-1.578a2 2 0 1 1 3.995 0h-.001q-.073.607-.333.988-.263.381-1.244 1.312h1.581v1h-4zm6.657-3.107a.75.75 0 0 1 .75-.75h9.5a.75.75 0 1 1 0 1.5h-9.5a.75.75 0 0 1 -.75-.75" />
					</svg>
				</button>

				<button
					type="button"
					aria-label="Blockquote"
					className={editorState.isBlockquote ? 'active' : ''}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				>
					<svg viewBox="0 0 20 20">
						<path d="m3 10.423a6.5 6.5 0 0 1 6.056-6.408l.038.67c-2.646.738-3.74 2.978-3.874 5.315h3.78c.552 0 .5.432.5.986v4.511c0 .554-.448.503-1 .503h-5c-.552 0-.5-.449-.5-1.003zm8 0a6.5 6.5 0 0 1 6.056-6.408l.038.67c-2.646.739-3.74 2.979-3.873 5.315h3.779c.552 0 .5.432.5.986v4.511c0 .554-.448.503-1 .503h-5c-.552 0-.5-.449-.5-1.003z" />
					</svg>
				</button>

				{/* <span className="separator" /> */}

				{/* ========================= Table ========================= */}
				{features.tables && (
					<button
						type="button"
						onClick={() =>
							editor
								.chain()
								.focus()
								.insertTable({
									rows: 3,
									cols: 3,
									withHeaderRow: true,
								})
								.run()
						}
					>
						<svg viewBox="0 0 20 20">
							<path d="m3 5.5v3h4v-3zm0 4v3h4v-3zm0 4v3h4v-3zm5 3h4v-3h-4zm5 0h4v-3h-4zm4-4v-3h-4v3zm0-4v-3h-4v3zm1.5 8a1.5 1.5 0 0 1 -1.5 1.5h-14a1.5 1.5 0 0 1 -1.5-1.5v-13.5c.222-.863 1.068-1.5 2-1.5h13c.932 0 1.778.637 2 1.5zm-6.5-4v-3h-4v3zm0-4v-3h-4v3z" />
						</svg>
					</button>
				)}

				<span className="separator" />

				{/* ========================= Images ========================= */}
				{features.images && (
					<div className="image-toolbar-group">
						<select
							aria-label="Image actions"
							defaultValue=""
							onChange={(event) => {
								const action = event.target.value

								if (action === 'upload') {
									fileInputRef.current?.click()
								} else if (action === 'library') {
									setMediaLibraryOpen(true)
								}

								event.target.value = ''
							}}
						>
							<option value="" disabled hidden>
								Image...
							</option>
							<option value="upload">Upload image</option>
							<option value="library">Media library</option>
						</select>

						{editorState.isImageActive && (
							<div className="alt-input__wraper">
								<label>Image Alt</label>
								<input
									type="text"
									className="alt-input"
									placeholder="Alt text..."
									value={editorState.imageAlt}
									onChange={(event) => {
										const alt = event.target.value
										editor.commands.updateAttributes('image', { alt })
									}}
								/>
							</div>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							hidden
							onChange={async (event) => {
								const file = event.target.files?.[0]
								if (!file) return

								onUploadingChange(true)
								onError(null)

								try {
									const media = await uploadMedia(file, uploadOptions)
									insertMedia(editor, media, file.name.replace(/\.[^/.]+$/, ''))
								} catch (error) {
									const message = error instanceof Error ? error.message : 'Image upload failed.'
									onError(message)
									console.error('Image upload failed:', error)
								} finally {
									onUploadingChange(false)
									event.target.value = ''
								}
							}}
						/>
					</div>
				)}

				<span className="separator" />

				{/* ========================= HTML Source ========================= */}

				{features.sourceEditing && (
					<button
						type="button"
						className="source-button"
						onClick={() => {
							window.dispatchEvent(new CustomEvent('html-editor:source'))
						}}
					>
						<svg viewBox="0 0 20 20">
							<path d="m12.5 0 5 4.5v15.003h-16v-19.503zm-9.5 1.5v3.25l-1.497 1-.003 8 1.5 1v3.254l4.685-.004-.001 1.504h9.816v-11.502l-1.5 1.426-.004-4.22-4.222-3.692z" />
							<path d="m4.06 6.64a.75.75 0 0 1 .958 1.15l-.085.07-2.643 1.89 2.646 1.89c.302.216.4.62.232.951l-.058.095a.75.75 0 0 1 -.951.232l-.095-.058-3.5-2.5v-1.22zm4.194 6.22a.75.75 0 0 1 -.958-1.149l.085-.07 2.643-1.89-2.646-1.89a.75.75 0 0 1 -.232-.952l.058-.095a.75.75 0 0 1 .95-.232l.096.058 3.5 2.5v1.22zm7.644-.836 2.122 2.122-5.825 5.809-2.125-.005.003-2.116zm2.539-1.847 1.414 1.414a.5.5 0 0 1 0 .707l-1.06 1.06-2.122-2.12 1.061-1.061a.5.5 0 0 1 .707 0" />
						</svg>
					</button>
				)}
			</div>

			{/* ================================== TABLE TOOLBAR ================================== */}

			{features.tables && editorState.isTableActive && (
				<div className="html-editor-table-toolbar">
					<strong>Table:</strong>

					<button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>
						+ Column before
					</button>

					<button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
						+ Column after
					</button>

					<button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>
						− Column
					</button>

					<span className="separator" />

					<button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>
						+ Row before
					</button>

					<button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
						+ Row after
					</button>

					<button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
						− Row
					</button>

					<span className="separator" />

					<button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>
						Merge
					</button>

					<button type="button" onClick={() => editor.chain().focus().splitCell().run()}>
						Split
					</button>

					<button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
						Header row
					</button>

					<button type="button" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
						Header column
					</button>

					<button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>
						Delete table
					</button>
				</div>
			)}

			{/* ================================== MEDIA LIBRARY ================================== */}

			<MediaLibraryModal
				open={mediaLibraryOpen}
				mediaCollection={uploadOptions.mediaCollection || 'media'}
				onClose={() => setMediaLibraryOpen(false)}
				onSelect={(media) => {
					insertMedia(editor, media)
				}}
			/>
		</>
	)
}
