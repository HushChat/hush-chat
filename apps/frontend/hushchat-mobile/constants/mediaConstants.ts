export const ACCEPT_IMAGE_TYPES = ['image/*'].join(',');
export const ACCEPT_DOC_TYPES = [
  '.pdf',
  'application/pdf',
  '.doc',
  '.docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls',
  '.xlsx',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',');

export const ACCEPT_FILE_TYPES = [ACCEPT_IMAGE_TYPES, ACCEPT_DOC_TYPES].join(',');

export const DOC_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

export const SIZES = ['Bytes', 'KB', 'MB'];
