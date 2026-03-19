import type { CollectionConfig } from 'payload'

export const HistoryLogs: CollectionConfig = {
  slug: 'history-logs',
  admin: {
    useAsTitle: 'id', // Better to use a virtual field or relation title
    defaultColumns: ['movie', 'user', 'watchedAt', 'rating'],
  },
  access: {
    // Only authenticated users can read/modify their own logs, admins can see all
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return user ? { user: { equals: user.id } } : false
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return user ? { user: { equals: user.id } } : false
    },
    delete: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) return true
      return user ? { user: { equals: user.id } } : false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies',
      required: true,
    },
    {
      name: 'watchedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: 'Rating out of 10',
      },
    },
    {
      name: 'review',
      type: 'textarea',
    },
    {
      name: 'isRewatch',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
