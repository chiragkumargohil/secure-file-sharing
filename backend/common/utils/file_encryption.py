# file encryption
# Let's work on File encryption as one of the requirements.
# - File Encryption: Ensure files are encrypted at rest and securely decrypted on download.
# - Files should be encrypted at rest using a strong encryption alogorithm (eg AES-256)
# - Allow users to download files and decrypt them securely on the client side.

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

def encrypt_file(file_data):
    """
    Encrypts a file using AES-256 encryption.
    Args:
        file_path (str): Path to the file to encrypt.
        key (bytes): 32-byte encryption key.
    Returns:
        (bytes, bytes): Encrypted file content and IV.
    """
    key = get_random_bytes(32)
    cipher = AES.new(key, AES.MODE_GCM)
    iv = cipher.nonce

    ciphertext, tag = cipher.encrypt_and_digest(file_data)
    return ciphertext, iv, tag, key

def decrypt_file(ciphertext, key, iv, tag):
    """
    Decrypts an AES-256 encrypted file.
    Args:
        ciphertext (bytes): Encrypted file content.
        key (bytes): 32-byte encryption key.
        iv (bytes): Initialization vector (nonce).
        tag (bytes): Authentication tag.
    Returns:
        bytes: Decrypted file content.
    """
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    file_data = cipher.decrypt_and_verify(ciphertext, tag)
    return file_data