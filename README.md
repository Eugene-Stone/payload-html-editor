# Payload HTML Editor

**A visual HTML editor field for Payload CMS 3, powered by Tiptap.**

Give content editors a familiar toolbar-based WYSIWYG workflow, similar in spirit to the classic WordPress editor or CKEditor, while keeping the saved value as an HTML string in a regular Payload `textarea` field.

This is an independent editor built with Tiptap—not a WordPress or CKEditor clone, and not affiliated with either project. Choose it when you want HTML as your content format instead of Payload Lexical's JSON representation.

## Why use it?

- **HTML in, HTML out.** The field stores an HTML string, which can fit existing HTML-based content and rendering pipelines.
- **Native Payload field.** Uses a normal `textarea` field and Payload's admin field component system.
- **Familiar editing tools.** Format text, create headings and lists, align text, add links, and edit tables.
- **Payload media integration.** Select images from a Payload upload collection or upload them from the editor.
- **Optional HTML source editor.** Inspect and edit source when visual editing is not enough.
- **Choose your features.** Turn images, tables, alignment, and source editing on or off per field.

## Install

```sh
npm install payload-html-editor
```

### Peer dependencies

This package uses Payload, React, and Tiptap packages provided by your application. With npm 7 or later, npm installs peer dependencies automatically by default. If your project sets `legacy-peer-deps=true` in `.npmrc`, npm skips that automatic installation. Remove that setting or install the Tiptap packages explicitly:

```sh
npm install \
  @tiptap/core@^3.31.4 \
  @tiptap/extension-file-handler@^3.31.4 \
  @tiptap/extension-image@^3.31.4 \
  @tiptap/extension-table@^3.31.4 \
  @tiptap/extension-text-align@^3.31.4 \
  @tiptap/react@^3.31.4 \
  @tiptap/starter-kit@^3.31.4
```

Payload, `@payloadcms/ui`, React, and React DOM are also declared as peer dependencies. A Payload application normally already has these installed.

The editor component imports its styles. If your application needs a direct CSS import, include this in your admin bundle:

```ts
import 'payload-html-editor/styles.css'
```

## Quick start

Add the plugin to your Payload config. Set `mediaCollection` to the slug of your Payload upload collection:

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

Use the field in a collection or global:

```ts
import type { CollectionConfig } from 'payload'
import { htmlEditorField } from 'payload-html-editor'

export const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    htmlEditorField({
      name: 'content',
      label: 'Content',
    }),
  ],
}
```

Regenerate Payload's admin import map after adding or changing the field:

```sh
npx payload generate:importmap
```

## Features and options

All editor features are enabled by default. Disable individual features for a field:

```ts
htmlEditorField({
  name: 'summary',
  features: {
    images: false,
    tables: false,
    sourceEditing: false,
    textAlignment: true,
  },
})
```

The plugin's `mediaCollection` is the default for every editor field. A field can override it:

```ts
htmlEditorField({
  name: 'content',
  mediaCollection: 'assets',
  maxUploadSize: 5 * 1024 * 1024,
})
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | Required | Payload field name |
| `label` | `string` | Field name | Admin field label |
| `required` | `boolean` | `false` | Whether the field is required |
| `mediaCollection` | `string` | Plugin setting or `media` | Upload collection used for image selection and upload |
| `maxUploadSize` | `number` | 10 MB | Maximum image upload size in bytes |
| `features.images` | `boolean` | `true` | Image insertion, upload, and media library |
| `features.tables` | `boolean` | `true` | Table editing controls |
| `features.sourceEditing` | `boolean` | `true` | HTML source modal |
| `features.textAlignment` | `boolean` | `true` | Text alignment controls |
| `admin` | `TextareaField['admin']` | — | Additional Payload admin field configuration |
| `componentPath` | `string` | `payload-html-editor/client#HtmlEditor` | Custom admin field component path |

Disabled features are omitted from both the toolbar and the Tiptap extension list.

## Media collection

Image upload and selection use Payload's REST API with the current admin user's credentials. Configure an upload collection and make sure its documents include:

- `id`
- `url`
- Optional `alt`, `filename`, `width`, and `height`
- Optional `sizes` with `url` and `width` for responsive `srcset`

Uploads are limited to JPEG, PNG, WebP, and GIF. Configure access on your collection as appropriate for your Payload users.

## Is this a CKEditor or WordPress replacement?

It offers a comparable **toolbar-based visual editing workflow** for common rich-text tasks, but it is not feature-for-feature compatible with CKEditor or WordPress. It is designed specifically as a Payload CMS field, and Tiptap's schema determines which HTML elements and attributes can be represented.

Existing HTML may be a useful starting point when migrating, but test representative content before switching. WordPress block-editor comments/blocks and markup or editor-specific CKEditor data may need conversion. Unsupported tags and attributes can be removed when Tiptap parses and saves content.

## Security

The source editor allows admins to enter HTML that Tiptap can parse through its configured schema. **This package does not sanitize HTML for public display.** Sanitize saved content at your application's output boundary according to your XSS policy, especially if content can be supplied by untrusted users.

## Compatibility

The published package is developed and tested with:

- Payload CMS `3.90.x`
- React `19.2.x`
- Tiptap `3.31.x`
- Node.js `^18.20.2 || >=20.9.0`

Payload, React, and Tiptap are peer dependencies. Next.js is not required by the package itself, but is commonly used with Payload.

## Development

```sh
npm install
npm run build
npm run pack:check
```

`npm run pack:check` builds the package and previews the files that would be published. Before opening a release, test the packed package in a Payload application.

## License

MIT
