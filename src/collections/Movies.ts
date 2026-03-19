import type { CollectionConfig } from 'payload'

const formatSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Movies: CollectionConfig = {
  slug: 'movies',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'releaseDate', 'tmdbId', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
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
            const nextValue = typeof value === 'string' && value.length > 0 ? value : data?.title

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
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tmdbOriginalTitle',
      type: 'text',
    },
    {
      name: 'originalLanguage',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'overview',
      type: 'textarea',
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'releaseDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'adult',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'video',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'runtime',
      type: 'number',
      min: 0,
    },
    {
      name: 'voteAverage',
      type: 'number',
      min: 0,
      max: 10,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'voteCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'popularity',
      type: 'number',
      min: 0,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'genres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'movie-collections',
      admin: {
        position: 'sidebar',
        description: 'Linked series (e.g. Hobbit, LOTR, Spider-man sets).',
      },
    },
    {
      name: 'productionCompanies',
      type: 'array',
      fields: [
        {
          name: 'tmdbCompanyId',
          type: 'number',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'originCountry',
          type: 'text',
        },
        {
          name: 'logoUrl',
          type: 'text',
        },
      ],
    },
    {
      name: 'productionCountries',
      type: 'array',
      fields: [
        {
          name: 'iso31661',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'spokenLanguages',
      type: 'array',
      fields: [
        {
          name: 'englishName',
          type: 'text',
        },
        {
          name: 'iso6391',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'directors',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'cast',
      type: 'array',
      fields: [
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'people',
          required: true,
        },
        {
          name: 'character',
          type: 'text',
        },
      ],
    },
    {
      name: 'budgets',
      type: 'group',
      fields: [
        {
          name: 'budget',
          type: 'number',
          min: 0,
        },
        {
          name: 'revenue',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'backdropUrl',
      type: 'text',
      admin: {
        description: 'TMDB veya baska CDN uzerindeki backdrop linki.',
      },
    },
    {
      name: 'posterUrl',
      type: 'text',
      admin: {
        description: 'TMDB poster linki. Dosya projeye yuklenmez.',
      },
    },
    {
      name: 'customPosterUrl',
      type: 'text',
      admin: {
        description: 'Senin hazirladigin posterin Supabase Storage veya harici CDN linki.',
      },
    },
    {
      name: 'customBackdropUrl',
      type: 'text',
      admin: {
        description: 'Istege bagli custom backdrop linki.',
      },
    },
    {
      name: 'customAssetMeta',
      type: 'group',
      fields: [
        {
          name: 'posterSource',
          type: 'text',
        },
        {
          name: 'posterImportedAt',
          type: 'date',
        },
        {
          name: 'posterImportBatch',
          type: 'text',
        },
      ],
    },
    {
      name: 'externalAssets',
      type: 'array',
      admin: {
        description: 'Tum medya alanlari sadece URL olarak tutulur.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'kind',
          type: 'select',
          required: true,
          options: [
            { label: 'Poster', value: 'poster' },
            { label: 'Backdrop', value: 'backdrop' },
            { label: 'Logo', value: 'logo' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sourceLinks',
      type: 'group',
      fields: [
        {
          name: 'tmdb',
          type: 'text',
        },
        {
          name: 'imdb',
          type: 'text',
        },
        {
          name: 'homepage',
          type: 'text',
        },
      ],
    },
    {
      name: 'tmdbRaw',
      type: 'group',
      fields: [
        {
          name: 'details',
          type: 'json',
        },
        {
          name: 'alternativeTitles',
          type: 'json',
        },
        {
          name: 'credits',
          type: 'json',
        },
        {
          name: 'externalIds',
          type: 'json',
        },
        {
          name: 'images',
          type: 'json',
        },
        {
          name: 'keywords',
          type: 'json',
        },
        {
          name: 'lists',
          type: 'json',
        },
        {
          name: 'recommendations',
          type: 'json',
        },
        {
          name: 'releaseDates',
          type: 'json',
        },
        {
          name: 'reviews',
          type: 'json',
        },
        {
          name: 'similar',
          type: 'json',
        },
        {
          name: 'translations',
          type: 'json',
        },
        {
          name: 'videos',
          type: 'json',
        },
        {
          name: 'watchProviders',
          type: 'json',
        },
        {
          name: 'changes',
          type: 'json',
        },
      ],
    },
    {
      name: 'syncMeta',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'lastTmdbSyncAt',
          type: 'date',
        },
        {
          name: 'lastImportBatch',
          type: 'text',
        },
        {
          name: 'sourceLists',
          type: 'json',
        },
        {
          name: 'lastSyncStatus',
          type: 'text',
        },
        {
          name: 'tmdbPayloadHash',
          type: 'text',
        },
      ],
    },
  ],
}
