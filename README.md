# Medplus - Medical Image Security System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20(Mongo%2C%20Express%2C%20React%2C%20Node)-853E04)](https://github.com/shravani-n-10/Medplus)
[![Cryptography](https://img.shields.io/badge/Crypto-BGC%20%2B%20ECDH%20P--256%20%2B%20Chaotic%20Map-C27803)](https://github.com/shravani-n-10/Medplus)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Medplus** is a full-stack MERN application for ultra-secure medical image encryption, storage, and decryption (DICOM, MRI, CT Scans, X-Rays, Ultrasound).

It combines **Logistic Map Chaotic Systems**, **ECDH NIST P-256 Elliptic Curve Key Agreement**, and a **Genuine Blum-Goldwasser Cryptosystem (BGC)** with Chinese Remainder Theorem (CRT) decryption.

---

## 🌟 Key Features

- **Genuine Blum-Goldwasser Cryptosystem (BGC)**: Probabilistic encryption using Blum primes ($p, q \equiv 3 \pmod 4$), modulus $n = p \cdot q$, Blum Blum Shub (BBS) generator, and BigInt CRT exponentiation decryption ($u_p = y^{d_p} \pmod p$, $u_q = y^{d_q} \pmod q$).
- **ECDH NIST P-256 Key Exchange**: Key pair generation (`prime256v1`) and HKDF key derivation.
- **Logistic Map Chaotic Permutation**: Non-periodic pixel scrambling ($x_{n+1} = r \cdot x_n (1 - x_n)$).
- **Admin Approval Authorization**: Newly registered accounts start as `pending` and require explicit Admin approval before login is granted.
- **Security Audit Logging**: Live tracking of user registrations, logins, encryptions, and decryption attempts.
- **Tailwind UI/UX**: Custom chocolate brown (`#1E0A00`) and warm camel tan (`#C8AD8D`) theme with micro-animations and a 3-dots navigation menu (`⋮`).

---

## 🏗️ Architecture

```text
                  React + Tailwind (Frontend)
                               │
                               ▼
                    Express REST API (Backend)
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     Auth Controller    Crypto Pipeline      Admin Controller
          │                    │                    │
          ▼                    ▼                    ▼
     JWT Tokens         • Logistic Map       Mongoose Metadata
                        • ECDH NIST P-256    & Audit Logs
                        • Genuine BGC
```

---

## 🔐 Cryptographic Pipeline

1. **Stage 1 (Chaotic Permutation)**: Pixel byte scrambling via Logistic Map sequence.
2. **Stage 2 (ECDH Key Exchange)**: Ephemeral P-256 key pair agreement and HKDF key derivation.
3. **Stage 3 (Blum-Goldwasser BGC)**: LSB stream XOR encryption using BBS pseudorandom generator.
4. **Stage 4 (Decryption & Integrity)**: CRT BigInt Modular Exponentiation decryption and SHA-256 hash checksum verification.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (or local memory server fallback)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Express API runs on http://localhost:5000/
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Vite UI runs on http://localhost:3000/
```

---

## 🔑 Demo Credentials

- **Admin Account**: `admin@medicalsec.com` / `admin123`
- **User Account**: `sandeep@gmail.com` / `password123`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
