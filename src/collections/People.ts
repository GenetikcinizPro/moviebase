import type { CollectionConfig } from 'payload'

const formatSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const People: CollectionConfig = {
  slug: 'people',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'knownForDepartment', 'tmdbId', 'updatedAt'],
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
      name: 'tmdbId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'knownForDepartment',
      type: 'text',
    },
    {
      name: 'biography',
      type: 'textarea',
    },
    {
      name: 'profileUrl',
      type: 'text',
      admin: {
        description: 'TMDB profile image link.',
      },
    },
    {
      name: 'birthDate',
      type: 'date',
    },
    {
      name: 'deathDate',
      type: 'date',
    },
    {
      name: 'placeOfBirth',
      type: 'text',
    },
    {
      name: 'externalIds',
      type: 'group',
      fields: [
        { name: 'imdb', type: 'text' },
        { name: 'tmdb', type: 'text' },
      ],
    },
  ],
  timestamps: true,
}
