'use client'

import { useEffect, useState } from 'react'

import type { Editor } from '@tiptap/react'

const blockElements = new Set([
	'ADDRESS',
	'ARTICLE',
	'ASIDE',
	'BLOCKQUOTE',
	'DIV',
	'DL',
	'FIELDSET',
	'FIGCAPTION',
	'FIGURE',
	'FOOTER',
	'FORM',
	'H1',
	'H2',
	'H3',
	'H4',
	'H5',
	'H6',
	'HEADER',
	'HR',
	'LI',
	'MAIN',
	'NAV',
	'OL',
	'P',
	'PRE',
	'SECTION',
	'TABLE',
	'TBODY',
	'TD',
	'TFOOT',
	'TH',
	'THEAD',
	'TR',
	'UL',
])

function formatNode(node: Node, indentLevel: number): Node {
	if (!(node instanceof Element)) {
		return node.cloneNode(true)
	}

	const formattedElement = node.cloneNode(false) as Element
	const children = Array.from(node.childNodes)
	const hasBlockChildren = children.some(
		(child) => child instanceof Element && blockElements.has(child.tagName),
	)

	for (const child of children) {
		if (hasBlockChildren && child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) {
			continue
		}

		if (hasBlockChildren && child instanceof Element && blockElements.has(child.tagName)) {
			formattedElement.appendChild(document.createTextNode(`\n${'  '.repeat(indentLevel + 1)}`))
			formattedElement.appendChild(formatNode(child, indentLevel + 1))
		} else {
			formattedElement.appendChild(formatNode(child, indentLevel + 1))
		}
	}

	if (hasBlockChildren) {
		formattedElement.appendChild(document.createTextNode(`\n${'  '.repeat(indentLevel)}`))
	}

	return formattedElement
}

function formatHTML(html: string): string {
	const parsedHTML = new DOMParser().parseFromString(html, 'text/html')
	const formattedHTML = document.createElement('div')
	const nodes = Array.from(parsedHTML.body.childNodes)

	nodes.forEach((node, index) => {
		if (index > 0) {
			formattedHTML.appendChild(document.createTextNode('\n'))
		}

		formattedHTML.appendChild(formatNode(node, 0))
	})

	return formattedHTML.innerHTML
}

type Props = {
	editor: Editor
}

export function HtmlSourceModal({ editor }: Props) {
	const [open, setOpen] = useState(false)

	const [html, setHtml] = useState('')

	useEffect(() => {
		const handleOpen = () => {
			setHtml(formatHTML(editor.getHTML()))
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
