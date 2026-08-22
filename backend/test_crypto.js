/**
 * Unit Test Script for Cryptographic Engine
 */

const ECCEngine = require('./crypto/ecc');
const MedicalImageCryptoPipeline = require('./crypto/imageEncryption');

console.log('=== TESTING MEDICAL IMAGE CRYPTOGRAPHIC ENGINE ===');

// 1. Generate ECC NIST P-256 Key Pairs for Sender and Recipient
const senderKeys = ECCEngine.generateKeyPair();
const recipientKeys = ECCEngine.generateKeyPair();

console.log('✔ Sender Public Key (P-256):', senderKeys.publicKey.slice(0, 32) + '...');
console.log('✔ Recipient Public Key (P-256):', recipientKeys.publicKey.slice(0, 32) + '...');

// 2. Create Dummy Medical Image Buffer (Simulating DICOM/PNG byte stream)
const mockImageBuffer = Buffer.from('MEDICAL_DICOM_IMAGE_HEADER_PAYLOAD_BYTE_STREAM_' + 'A'.repeat(5000));
console.log('✔ Created Mock Medical Image Buffer (Size:', mockImageBuffer.length, 'bytes)');

// 3. Execute 4-Stage Encryption Pipeline
const pipeline = new MedicalImageCryptoPipeline();
const encResult = pipeline.encrypt(mockImageBuffer, senderKeys.privateKey, recipientKeys.publicKey);

console.log('\n--- 🔐 ENCRYPTION COMPLETED ---');
console.log('Duration:', encResult.durationMs, 'ms');
console.log('Throughput:', encResult.throughputKBps, 'KB/s');
console.log('Original SHA-256:', encResult.originalHash);
console.log('Encrypted SHA-256:', encResult.encryptedHash);
console.log('Ciphertext Length:', encResult.ciphertext.length, 'bytes');

// 4. Execute 4-Stage Decryption Pipeline
const decResult = pipeline.decrypt(encResult.ciphertext, recipientKeys.privateKey, senderKeys.publicKey);

console.log('\n--- 🔓 DECRYPTION COMPLETED ---');
console.log('Duration:', decResult.durationMs, 'ms');
console.log('Restored SHA-256:', decResult.restoredHash);

// 5. Assert Byte Fidelity
if (encResult.originalHash === decResult.restoredHash) {
  console.log('\n✅ TEST PASSED: 100% Exact Byte Fidelity Verified! Original and Decrypted hashes match perfectly.');
} else {
  console.error('\n❌ TEST FAILED: Hashes do not match!');
  process.exit(1);
}
