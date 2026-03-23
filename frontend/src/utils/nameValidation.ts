export const MAX_NAME_BYTES = 100;
const UTF8_ENCODER = new TextEncoder();

export function getUtf8ByteLength(value: string) {
  return UTF8_ENCODER.encode(value).length;
}

export function getNameLengthError(value: string, label: string) {
  const byteLength = getUtf8ByteLength(value);

  if (byteLength === 0) {
    return `${label} must be between 1 and ${MAX_NAME_BYTES} bytes.`;
  }

  if (byteLength > MAX_NAME_BYTES) {
    return `${label} must be ${MAX_NAME_BYTES} bytes or fewer.`;
  }

  return null;
}
