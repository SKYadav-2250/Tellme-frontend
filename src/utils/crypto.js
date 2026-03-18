import CryptoJS from 'crypto-js'

/**
 * Derive a deterministic AES key from the roomId.
 * In a production app you'd use a proper key exchange (e.g. ECDH).
 * For this demo, both clients independently derive the same key from roomId.
 */
const deriveKey = (roomId) => {
  return CryptoJS.PBKDF2(roomId, 'tellme_salt_v1', {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString()
}

/**
 * Encrypt a plaintext string using AES-256.
 * Returns a Base64-encoded ciphertext string.
 */
export const encryptMessage = (text, roomId) => {
  try {
    const key = deriveKey(roomId)
    const encrypted = CryptoJS.AES.encrypt(text, key).toString()
    return encrypted
  } catch (err) {
    console.error('Encryption failed:', err)
    return text
  }
}

/**
 * Decrypt an AES-encrypted string.
 * Returns the original plaintext.
 */
export const decryptMessage = (ciphertext, roomId) => {
  try {
    const key = deriveKey(roomId)
    const bytes = CryptoJS.AES.decrypt(ciphertext, key)
    return bytes.toString(CryptoJS.enc.Utf8) || '[decryption failed]'
  } catch (err) {
    console.error('Decryption failed:', err)
    return '[decryption failed]'
  }
}
