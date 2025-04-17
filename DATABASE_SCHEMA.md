# Database Schema Overview (Supabase - Public Schema)

This document provides a high-level overview of the key tables within the `public` schema of the Supabase database.

## General Principles

- **Primary Keys:** Most core tables (`users`, `posts`) use UUIDs (`id` column with default `gen_random_uuid()`) as primary keys.
- **Relationships:** Foreign keys are used to link tables (e.g., `posts.user_id` -> `users.id`, `posts.reply_to_id` -> `posts.id`).
- **Timestamps:** Standard `created_at` and `updated_at` columns (timestamp with time zone, default `now()`) are common.
- **Counts:** Many tables store pre-calculated counts (e.g., `posts.likes_count`, `posts.reposts_count`) likely updated via triggers or functions.
- **Soft Deletes:** The `posts` table uses an `is_deleted` boolean flag for soft deletion.

## Key Tables (`public` schema)

- **`users`**

  - Stores user profile information.
  - `id` (UUID, PK): Unique user identifier. **This UUID is typically the foreign key linked to the `id` in the `auth.users` table managed by Supabase Auth.**
  - `address` (text): Wallet address, likely used for authentication linking.
  - `handle` (text): User's chosen handle (e.g., `@username`).
  - `display_name` (text): User's display name.
  - `avatar_url` (text): URL for profile picture.
  - `header_url` (text): URL for profile banner image.
  - `bio` (text): User biography.
  - `location` (text): User location.
  - `ens_name` (text): Associated ENS name.
  - `tier` (text): User tier (e.g., 'blue').
  - `buzz_balance` (bigint): User's balance of $BUZZ.
  - `verification_type` (enum): Verification status.
  - `group_id` (UUID, FK -> `affiliate_groups.id`): Link to affiliate group.

- **`posts`**

  - Stores individual posts (tweets/casts).
  - `id` (UUID, PK): Unique post identifier.
  - `user_id` (UUID, FK -> `users.id`): The author of the post.
  - `content` (text): The text content of the post.
  - `media_urls` (ARRAY): List of URLs for attached media.
  - `image_url` (text): (Potentially legacy/primary?) image URL.
  - `reply_to_id` (UUID, FK -> `posts.id`): If the post is a reply, links to the parent post.
  - `is_repost` (boolean): Flag indicating if this is a repost.
  - `repost_id` (UUID, FK -> `posts.id`): If a repost, links to the original post.
  - `is_token_gated` (boolean): Flag for token-gated content.
  - `required_tier` (text): Tier required to view if token-gated.
  - `likes_count`, `reposts_count`, `replies_count`, `views_count` (integer): Counters for engagement.
  - `is_deleted` (boolean): Flag for soft deletion.

- **`follows`**

  - Represents the follower relationship between users.
  - Likely contains `follower_id` (FK -> `users.id`) and `following_id` (FK -> `users.id`).
  - Has a composite primary key or unique constraint on `(follower_id, following_id)`.

- **`likes` / `post_likes`** (Note: `likes` table seems large, `post_likes` is small - might be a migration artifact or different purposes? Let's assume `likes` is the main one for now)

  - Represents a user liking a post.
  - Likely contains `user_id` (FK -> `users.id`) and `post_id` (FK -> `posts.id`).
  - Has a composite primary key or unique constraint on `(user_id, post_id)`.

- **`post_reposts`**

  - Tracks which users reposted which posts (distinct from the `posts` entry where `is_repost=true`).
  - Likely contains `user_id` (FK -> `users.id`) and `post_id` (FK -> `posts.id`).

- **`post_bookmarks`**

  - Tracks which users bookmarked which posts.
  - Likely contains `user_id` (FK -> `users.id`) and `post_id` (FK -> `posts.id`).

- **`notifications`**

  - Stores notifications for users (mentions, likes, follows, etc.).
  - Likely contains `user_id` (recipient), `actor_id` (who performed the action, FK -> `users.id`), `type` (enum: like, follow, mention), `entity_id` (e.g., post ID or null), `is_read` (boolean).

- **`siwe_nonces`**

  - Likely used for Sign-In with Ethereum (SIWE) authentication flow to store temporary nonces.

- **`user_preferences`**
  - Stores user-specific settings.

## Other Schemas

- **`auth`:** Managed by Supabase Auth. Contains user authentication data (linked to `public.users` likely via UUID).
- **`storage`:** Managed by Supabase Storage. Contains metadata about stored files (linked via buckets like `post_images`, `profile-media`).
  - **RLS Policies:** Row Level Security policies are applied to tables like `storage.objects`. For example, the `post_images` bucket requires the user to have the `authenticated` role for `INSERT` operations (uploads), while `SELECT` (reads) from `avatars` and `headers` subfolders are allowed for the `public` role.

_This is a summary based on inspection tools. Refer to specific table schemas or migrations for complete details._
