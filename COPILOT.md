# NextSet contributor context

## Application

NextSet is an Expo/React Native app for matching musicians with bands. The
current product flow begins with a musician account:

1. Authenticate with Supabase.
2. Select a role during onboarding.
3. Create a musician profile.
4. Browse and filter band opportunities.
5. Apply to a band post and communicate with the band.

Users can also create or join band accounts. Band accounts manage recruitment
posts and use private invite codes for membership. Invited collaborators may
view the band, create and manage their own recruitment posts, browse
opportunities, and apply through their linked musician profile.

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
| `videos` | JSON text array of `{ url, thumbnailUrl }` performance-video metadata |
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

Confirmed membership is unique per `(band_id, user_id)`. A leader is a member
with `is_leader = true`.

### `band_roster_members`

Created by `supabase/migrations/20261105173000_add_band_roster_members.sql`.
This is a visual-only roster for bandmates who do not use NextSet. It is
separate from `band_members`, grants no account access, and is managed only by
band leaders.

| Column | Type |
|---|---|
| `id` | `uuid`, primary key |
| `band_id` | `uuid`, references `Bands.id` |
| `name` | required `text` |
| `role`, `image_url` | nullable `text` |
| `created_at`, `updated_at` | `timestamptz` |

### `band_join_requests`

Created by `supabase/migrations/20261105151000_add_band_membership_workflow.sql`.
This legacy approval queue remains in the database but is not part of the
current UI flow. Do not add new UI dependencies on it without a product
decision to restore approval-based membership.

| Column | Type | Relationship |
|---|---|---|
| `id` | `uuid`, primary key | |
| `band_id` | `uuid` | References `Bands.id`. |
| `musician_id` | `uuid` | References `Musicians.id`. |
| `requested_role` | `text` | Optional role requested by the musician. |
| `status` | `text` | `pending`, `approved`, `rejected`, or `cancelled`. |
| `created_at`, `updated_at` | `timestamptz` | |

### `bandPosts`

Band recruitment opportunities shown in the musician feed.

| Column | Type |
|---|---|
| `id` | `uuid`, primary key |
| `band_id` | `uuid`, references `Bands.id` |
| `title`, `description`, `roles_needed`, `commitment_level` | `text` |
| `created_by` | `uuid`, nullable, references the creating band member |
| `is_open` | `boolean` |
| `min_age`, `max_age` | `bigint` |
| `created_at`, `updated_at` | `timestamptz` |

### `band_invites`

Created by `supabase/migrations/20261105154000_add_band_invites_and_posts.sql`.
Each band has one reusable active invite code. Leaders can retrieve, share, and
rotate it. A valid code immediately creates a confirmed `band_members` row.

| Column | Type |
|---|---|
| `id` | `uuid`, primary key |
| `band_id`, `created_by` | `uuid` |
| `code` | unique `text` invite code |
| `revoked_at` | nullable `timestamptz` |
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
- Use `lib/music.ts` as the single source of truth for selectable music genres.
  Store its canonical labels; use `genresMatch` when matching existing data so
  formatting variants such as `Posthardcore` and `Post-Hardcore` still match.
- Profile media uses the public `avatars` and `videos` buckets. Store only the
  resulting public URLs in `avatar_url` and `videos`; the mobile client must
  still have authenticated `storage.objects` insert policies for both buckets.
- Profile-video thumbnails are generated at upload time and stored in the
  public `gallery` bucket. New `videos` values are JSON objects with `url` and
  `thumbnailUrl`; the app remains compatible with older URL-only entries.
- Respect Supabase RLS policies. Do not embed service-role keys or bypass
  policies in the mobile client.
- Treat `onboarding_complete` as the source of truth for whether an
  authenticated musician should be sent to profile setup or the main tabs.
- Create bands only through `create_band`; it atomically creates the `Bands`
  record, leader membership, and initial invite. Join an existing band only
  through `join_band_with_invite`; do not provide public band discovery or
  membership-request UI.
- Invited `band_members` are collaborators: they can view the band, create
  posts, browse opportunities, and submit applications using their linked
  musician profile. They cannot view invite codes, edit the band profile,
  manage members, or delete the band.
- Use the security-definer RPCs instead of direct writes for protected band
  actions: `get_band_invite_code`, `rotate_band_invite_code`,
  `join_band_with_invite`, `get_band_members`, and `create_band_post`.
- All confirmed band members may create recruitment posts through
  `create_band_post`. A post's creator or a band leader may update its
  details or open/closed state through `update_band_post`.
- Only a band leader may update or delete a band through `update_band` and
  `delete_band`. Deleting a band also removes its posts, applications,
  memberships, and invitations.
- Only a band leader may update another member's role or remove them through
  `update_band_member` and `remove_band_member`. A leader cannot remove
  themselves.
- Visual-only bandmates are managed through the `band_roster_members` RPCs:
  `get_band_roster_members`, `add_band_roster_member`,
  `update_band_roster_member`, and `remove_band_roster_member`. They must
  never be treated as authenticated members.
- `services/activeAccount.ts` persists the selected musician or confirmed band
  account locally. A band is eligible to become active only after a
  `band_members` row exists.

## Current UI mapping

| Screen | Intended data |
|---|---|
| `app/ProfileSetup.tsx` | Create/update `Musicians`; complete onboarding. |
| `app/(tabs)/Profile.tsx` | Read current musician or band profile; band roster is visual-only. |
| `app/(tabs)/Feed.tsx` | Open `bandPosts` for musician and band collaborator accounts. |
| `app/(tabs)/Search.tsx` | Filter open `bandPosts` and `Bands` for all account modes. |
| `app/BandDetail.tsx` | Apply to an open post through the signed-in musician profile. |
| `app/Bands.tsx` | Create bands, join with a private invite, and switch active accounts. |
| `app/JoinBand.tsx` | Redeem a private band invite code. |
| `app/BandPosts.tsx` | List and create the active band's recruitment posts. |
| `app/BandSetup.tsx` | Leader-only band profile editor, visual roster management, and deletion flow. |
| `app/BandMembers.tsx` | Leader-only authenticated collaborator role/access management. |
| `app/(tabs)/Settings.tsx` | Account switching plus leader-only invite and authenticated-member management. |
| `app/(tabs)/Messages.tsx` | Messaging schema has not yet been provided; do not fabricate one. |
