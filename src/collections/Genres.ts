import type { CollectionConfig } from 'payload'

export const Genres: CollectionConfig = {
  slug: 'genres',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tmdbGenreId', 'updatedAt'],
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
    },
    {
      name: 'tmdbGenreId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
