/**
 * Elliptic Curve Cryptography (ECC) Module
 * Standardized on ECDH using NIST P-256 (prime256v1)
 */

const crypto = require('crypto');

class ECCEngine {
  /**
   * Generates a new ECDH P-256 key pair
   * @returns {{ privateKey: string, publicKey: string }} Keys encoded in Hex
   */
  static generateKeyPair() {
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.generateKeys();
    return {
      privateKey: ecdh.getPrivateKey('hex'),
      publicKey: ecdh.getPublicKey('hex')
    };
  }

  /**
   * Computes ECDH shared secret between local private key and peer's public key
   * @param {string} localPrivateKeyHex Private key in hex
   * @param {string} peerPublicKeyHex Peer's public key in hex
   * @returns {Buffer} 32-byte shared secret point
   */
  static computeSharedSecret(localPrivateKeyHex, peerPublicKeyHex) {
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(localPrivateKeyHex, 'hex');
    const sharedSecret = ecdh.computeSecret(peerPublicKeyHex, 'hex');
    return sharedSecret;
  }

  /**
   * Key Derivation Function (KDF) using SHA-256 on shared secret
   * @param {Buffer} sharedSecret ECDH shared secret
   * @returns {Buffer} 32-byte derived symmetric key
   */
  static deriveKey(sharedSecret) {
    return crypto.createHash('sha256').update(sharedSecret).digest();
  }
}

module.exports = ECCEngine;
