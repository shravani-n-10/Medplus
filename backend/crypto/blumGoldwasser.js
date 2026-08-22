/**
 * Genuine Blum-Goldwasser Cryptosystem (BGC) Module
 * Implements the asymmetric probabilistic cryptosystem with full mathematical construction:
 *
 * 1. Key Generation:
 *    - Blum Primes p, q (where p ≡ 3 mod 4 and q ≡ 3 mod 4)
 *    - Public Key: n = p * q
 *    - Private Key: (p, q)
 *
 * 2. Encryption (using Public Key n):
 *    - Choose random seed r in Z_n*
 *    - Compute initial state x_0 = r^2 mod n
 *    - For t = length_in_bits, compute BBS sequence x_i = x_{i-1}^2 mod n
 *    - Extract LSB of each x_i to form keystream bits b_1..b_t
 *    - Compute ciphertext bits c_i = m_i ⊕ b_i
 *    - Compute final state y = x_{t+1} = x_t^2 mod n
 *    - Return Ciphertext Payload = (C, y)
 *
 * 3. Decryption (using Private Key (p, q) and final state y):
 *    - Compute d_p = ((p + 1) / 4)^(t + 1) mod (p - 1)
 *    - Compute d_q = ((q + 1) / 4)^(t + 1) mod (q - 1)
 *    - Compute u_p = y^(d_p) mod p
 *    - Compute u_q = y^(d_q) mod q
 *    - Combine u_p, u_q using Chinese Remainder Theorem (CRT) to compute x_0 mod n
 *    - Regenerate exact BBS sequence x_i = x_{i-1}^2 mod n and LSB keystream bits
 *    - Recover plaintext m_i = c_i ⊕ b_i
 */

const crypto = require('crypto');

class BlumGoldwasserEngine {
  constructor() {
    // Blum Primes: p ≡ 3 mod 4 and q ≡ 3 mod 4
    this.p = 1000000007n;
    this.q = 1000000087n;
    this.n = this.p * this.q; // Public key modulus n = 1000000094000000609n

    // Precompute CRT coefficients for fast decryption
    // r_p * p + r_q * q = 1
    const { rp, rq } = this.extendedGCD(this.p, this.q);
    this.rp = rp;
    this.rq = rq;
  }

  /**
   * Helper: Modular Exponentiation (base^exp mod mod)
   */
  modPow(base, exp, mod) {
    let res = 1n;
    let b = base % mod;
    let e = exp;
    while (e > 0n) {
      if (e % 2n === 1n) res = (res * b) % mod;
      b = (b * b) % mod;
      e = e / 2n;
    }
    return res;
  }

  /**
   * Helper: Extended Euclidean Algorithm for CRT coefficients
   */
  extendedGCD(a, b) {
    let old_r = a, r = b;
    let old_s = 1n, s = 0n;
    let old_t = 0n, t = 1n;

    while (r !== 0n) {
      const quotient = old_r / r;
      let temp = r;
      r = old_r - quotient * r;
      old_r = temp;

      temp = s;
      s = old_s - quotient * s;
      old_s = temp;

      temp = t;
      t = old_t - quotient * t;
      old_t = temp;
    }
    return { rp: old_s, rq: old_t };
  }

  /**
   * BGC Encrypt Function (Probabilistic BGC Encryption)
   * @param {Buffer} plaintext Buffer payload
   * @param {Buffer} [seedKey] Optional seed key for deterministic entropy derivation
   * @returns {object} { ciphertextBuffer, finalStateY }
   */
  encryptBGC(plaintext, seedKey) {
    const totalBytes = plaintext.length;
    const totalBits = totalBytes * 8;

    // 1. Choose random seed r in Z_n*
    let r;
    if (seedKey) {
      const hash = crypto.createHash('sha256').update(seedKey).digest();
      r = (BigInt('0x' + hash.toString('hex')) % (this.n - 3n)) + 2n;
    } else {
      const randomBytes = crypto.randomBytes(16);
      r = (BigInt('0x' + randomBytes.toString('hex')) % (this.n - 3n)) + 2n;
    }

    // Ensure r is coprime to p and q
    if (r % this.p === 0n || r % this.q === 0n) r += 1n;

    // 2. Initial BBS state x_0 = r^2 mod n
    let x = (r * r) % this.n;

    const ciphertext = Buffer.alloc(totalBytes);

    // 3. Generate BBS stream bits and XOR with plaintext bits
    for (let byteIdx = 0; byteIdx < totalBytes; byteIdx++) {
      let cipherByte = 0;
      const plainByte = plaintext[byteIdx];

      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        // BBS iteration: x_{i} = x_{i-1}^2 mod n
        x = (x * x) % this.n;

        // Extract LSB (least significant bit)
        const bbsBit = Number(x & 1n);
        const plainBit = (plainByte >> bitIdx) & 1;
        const cipherBit = plainBit ^ bbsBit;

        cipherByte = (cipherByte << 1) | cipherBit;
      }
      ciphertext[byteIdx] = cipherByte;
    }

    // 4. Compute final state y = x_{t+1} = x_t^2 mod n
    const finalStateY = (x * x) % this.n;

    return {
      ciphertext,
      finalStateY,
      n: this.n
    };
  }

  /**
   * BGC Decrypt Function (Decryption using private primes p, q and final state y)
   * @param {Buffer} ciphertext Ciphertext buffer
   * @param {BigInt} finalStateY Final BBS state y = x_{t+1}
   * @returns {Buffer} Restored Plaintext buffer
   */
  decryptBGC(ciphertext, finalStateY) {
    const totalBytes = ciphertext.length;
    const totalBits = BigInt(totalBytes * 8);

    // 1. Compute CRT Exponents using private primes p and q
    // d_p = ((p + 1) / 4)^(t + 1) mod (p - 1)
    // d_q = ((q + 1) / 4)^(t + 1) mod (q - 1)
    const baseP = (this.p + 1n) / 4n;
    const baseQ = (this.q + 1n) / 4n;
    const expCount = totalBits + 1n;

    const dp = this.modPow(baseP, expCount, this.p - 1n);
    const dq = this.modPow(baseQ, expCount, this.q - 1n);

    // 2. Compute square roots mod p and mod q
    const up = this.modPow(finalStateY, dp, this.p);
    const uq = this.modPow(finalStateY, dq, this.q);

    // 3. Chinese Remainder Theorem (CRT) to reconstruct x_0 mod n
    // x_0 = (u_q * r_p * p + u_p * r_q * q) mod n
    let x0 = (uq * this.rp * this.p + up * this.rq * this.q) % this.n;
    if (x0 < 0n) x0 = (x0 % this.n) + this.n;

    // 4. Regenerate exact BBS keystream and decrypt bits
    let x = x0;
    const plaintext = Buffer.alloc(totalBytes);

    for (let byteIdx = 0; byteIdx < totalBytes; byteIdx++) {
      let plainByte = 0;
      const cipherByte = ciphertext[byteIdx];

      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        x = (x * x) % this.n;
        const bbsBit = Number(x & 1n);
        const cipherBit = (cipherByte >> bitIdx) & 1;
        const plainBit = cipherBit ^ bbsBit;

        plainByte = (plainByte << 1) | plainBit;
      }
      plaintext[byteIdx] = plainByte;
    }

    return plaintext;
  }

  // Wrapper interface for unified pipeline compatibility
  encrypt(plaintext, keySeed) {
    const bgcRes = this.encryptBGC(plaintext, keySeed);
    // Attach final state y (encoded as 16 hex chars) to the end of ciphertext buffer or metadata
    const yBuffer = Buffer.alloc(8);
    yBuffer.writeBigUInt64BE(bgcRes.finalStateY, 0);
    return Buffer.concat([bgcRes.ciphertext, yBuffer]);
  }

  decrypt(ciphertextWithY, keySeed) {
    const cipherLength = ciphertextWithY.length - 8;
    const ciphertext = ciphertextWithY.slice(0, cipherLength);
    const finalStateY = ciphertextWithY.readBigUInt64BE(cipherLength);
    return this.decryptBGC(ciphertext, finalStateY);
  }
}

module.exports = BlumGoldwasserEngine;
