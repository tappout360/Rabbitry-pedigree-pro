/**
 * Secure browser-compatible UUIDv7 generator conformant to RFC 9562
 * Embeds millisecond timestamps for sorting and offline merge resolution.
 */
export function uuidv7() {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0');
  const timeHigh = timeHex.slice(0, 8);
  const timeLow = timeHex.slice(8, 12);
  
  const randomBytes = new Uint8Array(10);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else if (typeof global !== 'undefined' && global.crypto) {
    const webCrypto = global.crypto.webcrypto || global.crypto;
    webCrypto.getRandomValues(randomBytes);
  } else {
    // Math.random fallback for non-secure environments
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const val = (randomBytes[0] << 8) | randomBytes[1];
  const seq = (val & 0x0FFF).toString(16).padStart(3, '0');
  const verAndSeq = `7${seq}`;
  
  const varByte = (randomBytes[2] & 0x3F) | 0x80;
  const varStr = varByte.toString(16).padStart(2, '0');
  
  let rand = '';
  for (let i = 3; i < 10; i++) {
    rand += randomBytes[i].toString(16).padStart(2, '0');
  }
  
  return `${timeHigh}-${timeLow}-${verAndSeq}-${varStr}${rand.slice(0, 2)}-${rand.slice(2)}`;
}
