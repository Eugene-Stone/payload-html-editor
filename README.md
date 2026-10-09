# payload-html-editor

HTML string editor field for Payload CMS 3, powered by Tiptap.

The editor stores content as an HTML string in a Payload `textarea` field. It does not replace your content with Payload Lexical JSON.

## Compatibility

- Payload CMS `3.90.x`
- React `19.2.x`
- Next.js `16.3.x`
- Tiptap `3.31.x`
- Node `^18.20.2 || >=20.9.0`

## Install

```sh
npm install payload-html-editor
```

The field component imports its own CSS. If your setup needs an explicit style import, add this once in your admin bundle:

```ts
import 'payload-html-editor/styles.css'
```

## Payload Config

```ts
import { buildConfig } from 'payload'
import { htmlEditorPlugin } from 'payload-html-editor'

export default buildConfig({
  plugins: [
    htmlEditorPlugin({
      mediaCollection: 'media',
    }),
  ],
})
```

After installing or changing admin components, regenerate Payload's import map:

```sh
npx payload generate:importmap
```

## Field Usage

```ts
import { htmlEditorField } from 'payload-html-editor'

export const Pages = {
  slug: 'pages',
  fields: [
    htmlEditorField({
      name: 'content',
      label: 'Content',
      features: {
        tables: true,
        images: true,
        sourceEditing: true,
        textAlignment: true,
      },
    }),
  ],
}
```

The plugin-level `mediaCollection` is used by all editor fields unless a field overrides it:

```ts
htmlEditorField({
  name: 'content',
  mediaCollection: 'assets',
})
```

## Options

```ts
import type { TextareaField } from 'payload'

type HtmlEditorFieldOptions = {
  name: string
  label?: string
  required?: boolean
  admin?: TextareaField['admin']
  componentPath?: string
  mediaCollection?: string
  maxUploadSize?: number
  features?: {
    tables?: boolean
    images?: boolean
    sourceEditing?: boolean
    textAlignment?: boolean
  }
}
```

`componentPath` defaults to `payload-html-editor/client#HtmlEditor`; override it only when using a custom admin field component.

Disabled features are removed from the Tiptap extension list and from the toolbar.

## Media Collection Requirements

Image upload and selection use Payload's normal REST API with the current admin user's credentials. The configured collection should be an upload collection and should return:

- `id`
- `url`
- optional `alt`
- optional `filename`
- optional `width` and `height`
- optional `sizes` entries with `url`, `width`, and `height`

The editor only adds `srcset` candidates when a size has both `url` and `width`.

## HTML And Security

The source editor lets admins submit HTML that Tiptap can parse through the configured schema. Unknown tags and unsupported attributes may be dropped by Tiptap.

Public rendering of saved HTML should still be sanitized at the output boundary according to your application's XSS policy, especially for links and user-provided markup.

## Package Development

```sh
npm install
npm run build
npm run pack:check
```

`npm run pack:check` runs `npm pack --dry-run` and shows the files that would be published.

## Publishing

Before publishing:

1. Confirm the package name, repository URL, author, and version in `package.json`.
2. Run `npm install`.
3. Run `npm run build`.
4. Run `npm run pack:check`.
5. Test the package in a fresh Payload CMS 3 project.
6. Publish with `npm publish` only after the dry run is correct.

## Third-Party Licenses

This package is MIT licensed. It relies on Payload, React, and Tiptap packages as peer dependencies. In the audited project versions, direct runtime dependencies used by this package are MIT licensed, including Payload UI, Payload, React, React DOM, and the listed Tiptap packages. Keep dependency license notices from your package manager output when publishing a larger distribution.
