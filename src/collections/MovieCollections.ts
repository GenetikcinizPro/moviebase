import type { CollectionConfig } from 'payload'

const formatSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const MovieCollections: CollectionConfig = {
  slug: 'movie-collections',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tmdbCollectionId', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            const nextValue = typeof value === 'string' && value.length > 0 ? value : data?.name

            if (typeof nextValue !== 'string' || nextValue.length === 0) {
              return value
            }

            return formatSlug(nextValue)
          },
        ],
      },
    },
    {
      name: 'tmdbCollectionId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'overview',
      type: 'textarea',
    },
    {
      name: 'posterUrl',
      type: 'text',
    },
    {
      name: 'backdropUrl',
      type: 'text',
    },
    {
      name: 'movies',
      type: 'join',
      collection: 'movies',
      on: 'collection',
    },
  ],
  timestamps: true,
}
