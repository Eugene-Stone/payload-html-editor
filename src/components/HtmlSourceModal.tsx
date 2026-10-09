'use client'

import { useEffect, useState } from 'react'

import type { Editor } from '@tiptap/react'

type Props = {
	editor: Editor
}

export function HtmlSourceModal({ editor }: Props) {
	const [open, setOpen] = useState(false)

	const [html, setHtml] = useState('')

	useEffect(() => {
		const handleOpen = () => {
			setHtml(editor.getHTML())
			setOpen(true)
		}

		window.addEventListener('html-editor:source', handleOpen)

		return () => {
			window.removeEventListener('html-editor:source', handleOpen)
		}
	}, [editor])

	if (!open) {
		return null
	}

	const save = () => {
		editor.commands.setContent(html, {
			emitUpdate: true,
		})

		setOpen(false)
	}

	return (
		<div
			className="html-source-overlay"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					setOpen(false)
				}
			}}
		>
			<div className="html-source-modal">
				<div className="html-source-header">
					<h2>HTML source</h2>

					<button type="button" onClick={() => setOpen(false)}>
						×
					</button>
				</div>

				<textarea
					value={html}
					onChange={(event) => setHtml(event.target.value)}
					spellCheck={false}
				/>

				<div className="html-source-footer">
					<button type="button" onClick={() => setOpen(false)}>
						Cancel
					</button>

					<button type="button" className="primary" onClick={save}>
						Apply
					</button>
				</div>
			</div>
		</div>
	)
}
