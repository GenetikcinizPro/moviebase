# MovieBase Payload

TMDB verisini cekip Payload uzerinde film arsivi yonetmek icin hazirlanmis bir baslangic projesi.

## Teknoloji

- Payload CMS 3
- Next.js 15
- Supabase Postgres
- TMDB API
- Link tabanli poster ve medya alanlari

## Kurulum

1. `pnpm install`
2. `.env.example` dosyasini `.env` olarak kopyala ve degerleri doldur
3. `pnpm dev`
4. Ilk admin kullanicisini `/admin` uzerinden olustur

## Ortam Degiskenleri

- `DATABASE_URL`: Supabase Postgres connection string
- `PAYLOAD_SECRET`: Payload secret
- `TMDB_API_TOKEN`: TMDB v4 bearer token
- `TMDB_LANGUAGE`: Varsayilan `tr-TR`
- `TMDB_IMAGE_BASE_URL`: Varsayilan `https://image.tmdb.org/t/p/original`
- `TMDB_IMPORT_PAGES`: Import script'i icin kac sayfa cekilecegi
- `TMDB_IMPORT_CONCURRENCY`: Ayni anda kac film detay fetch edilecegi
- `TMDB_SYNC_MODE`: `smart` veya `overwrite-links`
- `POSTER_IMPORT_FILE`: CSV veya JSON poster import dosyasi

## TMDB Import

Asagidaki komut discover, popular, top rated, upcoming ve now playing listelerinden filmleri toplayip `movies` koleksiyonuna upsert eder:

```bash
pnpm import:tmdb
```

Import edilen kayitlarda medya dosyalari yuklenmez. `posterUrl`, `backdropUrl`, `customPosterUrl`, `customBackdropUrl` ve `externalAssets` alanlarinda sadece URL tutulur.

### Sync Stratejisi

- `smart`: TMDB ham veri hash'i degismemisse kaydi atlar, custom poster alanlarini korur
- `overwrite-links`: yine upsert yapar ama link alanlarini TMDB tarafindan gelen degerlerle bastirmaya izin verir

## Bulk Poster Import

CSV veya JSON ile toplu custom poster baglamak icin:

```bash
pnpm import:posters
```

CSV kolonlari:

```csv
tmdbId,slug,imdbId,title,customPosterUrl,backdropUrl
603,,tt0133093,The Matrix,https://cdn.example.com/posters/matrix.jpg,https://cdn.example.com/backdrops/matrix.jpg
```

JSON ornegi:

```json
[
  {
    "tmdbId": 603,
    "customPosterUrl": "https://cdn.example.com/posters/matrix.jpg",
    "backdropUrl": "https://cdn.example.com/backdrops/matrix.jpg"
  }
]
```

## Custom Poster Akisi

- TMDB'den gelen varsayilan poster `posterUrl` alanina yazilir
- Sana ait posterleri Supabase Storage veya harici CDN'e yukleyip `customPosterUrl` alanina baglayabilirsin
- Frontend her zaman once `customPosterUrl`, sonra `posterUrl` kullanir
- Toplu poster baglantisi icin `POSTER_IMPORT_FILE` tanimlayip `pnpm import:posters` calistirabilirsin

magick mogrify -format webp \*.png
