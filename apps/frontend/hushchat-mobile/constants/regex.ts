export const URL_REGEX = /\b((?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/i;
export const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
export const PHONE_REGEX = /\+?[0-9][0-9\s-]{8,}[0-9]/;
export const MENTION_REGEX = /(^|\s)@([a-zA-Z0-9._-]+)([.,!?;:]*)/;
export const HASHTAG_REGEX = /(^|\s)(#[a-z\d-_]+)/;
export const MENTION_TOKEN_REGEX = /(^|\s)(@\S*)$/;
