/**
 * API Constants
 */

/**
 * Maximum number of results returned per page for nutrition data search
 */
export const NUTRITION_DATA_SEARCH_PAGINATION_LIMIT = 20;

/** Result ceiling; requesting this offset returns the terminal empty page. */
export const NUTRITION_DATA_SEARCH_MAX_OFFSET = 500;

/**
 * A chat photo lives in object storage. Its message part keeps `url: chat-image:<id>` instead of
 * the image data, so a saved message stays small enough to sync.
 */
export const CHAT_IMAGE_URL_PREFIX = 'chat-image:';

/** The largest chat photo the API stores. The app compresses photos to about 1 MB first. */
export const CHAT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** The photo types the API stores. */
export const CHAT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
