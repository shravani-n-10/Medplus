/**
 * Chaotic Key Generation & Permutation Module
 * Uses Logistic Map chaotic system: x_{n+1} = r * x_n * (1 - x_n)
 */

class ChaoticKeyGenerator {
  /**
   * @param {number} x0 Initial chaotic seed (0 < x0 < 1), e.g., 0.654321
   * @param {number} r Control parameter (3.57 < r <= 4.0), default 3.9999
   */
  constructor(x0 = 0.654321, r = 3.9999) {
    this.x0 = x0;
    this.r = r;
  }

  /**
   * Generates a sequence of pseudo-random bytes of length `len`
   * @param {number} len Length in bytes
   * @param {number} x0 Initial value
   * @param {number} r Control parameter
   * @returns {Buffer}
   */
  generateStream(len, x0 = this.x0, r = this.r) {
    let x = x0;
    // Warm up iterations to discard transient behavior
    for (let i = 0; i < 500; i++) {
      x = r * x * (1 - x);
    }

    const stream = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
      x = r * x * (1 - x);
      // Scale x (0 to 1) to integer byte range (0 to 255)
      stream[i] = Math.floor(x * 1000000) % 256;
    }
    return stream;
  }

  /**
   * Generates a chaotic permutation index mapping for buffer transformation
   * @param {number} len Size of buffer
   * @param {number} x0 Seed
   * @returns {Uint32Array} Permutation array mapping indices
   */
  generatePermutationMap(len, x0 = this.x0, r = this.r) {
    let x = x0;
    for (let i = 0; i < 300; i++) {
      x = r * x * (1 - x);
    }

    const arr = new Array(len);
    for (let i = 0; i < len; i++) {
      x = r * x * (1 - x);
      arr[i] = { val: x, idx: i };
    }

    // Sort based on chaotic float values to get pseudo-random permutation order
    arr.sort((a, b) => a.val - b.val);
    const permMap = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      permMap[i] = arr[i].idx;
    }
    return permMap;
  }

  /**
   * Applies chaotic XOR mask and pixel byte shuffling
   * @param {Buffer} buffer Input data
   * @param {number} x0 Seed
   * @returns {Buffer} Transformed buffer
   */
  encryptBuffer(buffer, x0 = this.x0) {
    const keyStream = this.generateStream(buffer.length, x0);
    const result = Buffer.alloc(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer[i] ^ keyStream[i];
    }
    return result;
  }

  /**
   * Reverses chaotic XOR mask
   * @param {Buffer} buffer Encrypted data
   * @param {number} x0 Seed
   * @returns {Buffer} Original data
   */
  decryptBuffer(buffer, x0 = this.x0) {
    // XOR is self-inverting
    return this.encryptBuffer(buffer, x0);
  }
}

module.exports = ChaoticKeyGenerator;
