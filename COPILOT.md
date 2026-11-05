# NextSet contributor context

## Application

NextSet is an Expo/React Native app for matching musicians with bands. The
current product flow begins with a musician account:

1. Authenticate with Supabase.
2. Select a role during onboarding.
3. Create a musician profile.
4. Browse and filter band opportunities.
5. Apply to a band post and communicate with the band.

Band profiles and band-created posts are planned next. Do not treat the
hard-coded arrays in the UI as production data; replace them with Supabase
queries as each screen is implemented.

## Supabase schema

The following schema already exists in Supabase. It is context only; do not
run schema migrations based on this file.

### `Musicians`

Supabase exposes this table as the case-sensitive `Musicians` table. Use the
exact names from this document for every Supabase query: `Musicians`, `Bands`,
and `bandPosts`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, generated UUID. |
| `name` | `text` | Musician name. |
| `bio` | `text` | Profile biography. |
| `genres` | `text` | Existing storage format is text; preserve the established format unless a migration is explicitly requested. |
| `roles` | `text` | JSON array of a musician's instruments and roles. Added by `supabase/migrations/20261105112500_add_musician_roles.sql`. |
| `experience_level` | `text` | Experience selected in profile setup. |
| `commitment_level` | `text` | Commitment selected in profile setup. |
| `videos` | `text` | Existing storage for profile video data. |
| `avatar_url` | `text` | Profile image URL. |
| `tier` | `text` | Account tier. |
| `Location` | user-defined | Location field; inspect its Supabase type before writing a client query. |
| `Age` | `date` | Existing age/date field. |
| `Gender` | `text` | Existing gender field. |
| `onboarding_complete` | `boolean` | Defaults to `false`; set to `true` only after a valid profile is saved. |
| `created_at`, `updated_at` | `timestamptz` | Record timestamps. |

### `Bands`

| Column | Type |
|---|---|
| `id` | `uuid`, primary key |
| `name`, `genre`, `location`, `description`, `image_url` | `text` |
| `created_at`, `updated_at` | `timestamptz` |

### `band_members`

Links a musician to a band.

| Column | Type | Relationship |
|---|---|---|
| `id` | `uuid`, primary key | |
| `band_id` | `uuid` | References `Bands.id`. |
| `user_id` | `uuid` | References `Musicians.id`. |
| `role` | `text` | Member role within the band. |
| `is_leader` | `boolean` | Band leadership flag. |
| `joined_at` | `timestamptz` | Membership timestamp. |

### `bandPosts`

Band recruitment opportunities shown in the musician feed.

| Column | Type |
|---|---|
| `id` | `uuid`, primary key |
| `band_id` | `uuid`, references `Bands.id` |
| `title`, `description`, `roles_needed`, `commitment_level` | `text` |
| `is_open` | `boolean` |
| `min_age`, `max_age` | `bigint` |
| `created_at`, `updated_at` | `timestamptz` |

### `requests`

A musician's application to a band post.

| Column | Type | Relationship |
|---|---|---|
| `id` | `uuid`, primary key | |
| `post_id` | `uuid`, required | References `bandPosts.id`. |
| `musician_id` | `uuid` | References `Musicians.id`. |
| `status` | `text` | Application state. |
| `created_at`, `updated_at` | `timestamptz` | |

## Data and implementation rules

- Always use the authenticated user ID deliberately when creating or locating
  the corresponding musician record. Verify the project's auth-to-musician ID
  mapping in Supabase before assuming the two IDs are identical.
- Set foreign keys (`band_id`, `user_id`, `post_id`, and `musician_id`)
  explicitly. The current schema defines generated UUID defaults on some
  foreign-key fields; relying on those defaults would create unrelated IDs.
- Query real data for feed cards, band details, profiles, and applications.
  Avoid adding new mock data as a feature implementation.
- Preserve the existing schema's text storage for genres, musician roles, and videos
  until a deliberate, coordinated schema migration changes it.
- Profile media uses the public `avatars` and `videos` buckets. Store only the
  resulting public URLs in `avatar_url` and `videos`; the mobile client must
  still have authenticated `storage.objects` insert policies for both buckets.
- Respect Supabase RLS policies. Do not embed service-role keys or bypass
  policies in the mobile client.
- Treat `onboarding_complete` as the source of truth for whether an
  authenticated musician should be sent to profile setup or the main tabs.

## Current UI mapping

| Screen | Intended data |
|---|---|
| `app/ProfileSetup.tsx` | Create/update `Musicians`; complete onboarding. |
| `app/(tabs)/Profile.tsx` | Read/update current `Musicians` record. |
| `app/(tabs)/Feed.tsx` | Open `bandPosts` joined with `Bands`. |
| `app/(tabs)/Search.tsx` | Filter open `bandPosts` and associated `Bands`. |
| `app/BandDetail.tsx` | Read a post, its band, and membership; create `requests`. |
| `app/(tabs)/Messages.tsx` | Messaging schema has not yet been provided; do not fabricate one. |
