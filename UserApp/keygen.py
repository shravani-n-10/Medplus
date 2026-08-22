# key_generation.py

from ecdsa import NIST256p, SigningKey
import os

def generate_and_save_keys(private_key_path='keys/recipient_private_key.pem', public_key_path='keys/recipient_public_key.pem'):
    # Generate ECC key pair
    private_key = SigningKey.generate(curve=NIST256p)
    public_key = private_key.get_verifying_key()

    # Export keys in PEM format
    private_key_pem = private_key.to_pem()
    public_key_pem = public_key.to_pem()

    # Ensure the keys directory exists
    keys_dir = os.path.dirname(private_key_path)
    if keys_dir:  # Only attempt to create if keys_dir is not empty
        os.makedirs(keys_dir, exist_ok=True)

    # Save private key
    with open(private_key_path, 'wb') as priv_file:
        priv_file.write(private_key_pem)

    # Save public key
    with open(public_key_path, 'wb') as pub_file:
        pub_file.write(public_key_pem)

    print(f"Keys generated and saved to '{private_key_path}' and '{public_key_path}'.")

if __name__ == "__main__":
    generate_and_save_keys()
