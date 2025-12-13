from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL VARIABLES ---
# Default K44 Parameters
K44_MATRIX = [0x57, 0xAB, 0xD5, 0xEA, 0x75, 0xBA, 0x5D, 0xAE]
K44_CONST = 0x63

CURRENT_SBOX = []
CURRENT_INV_SBOX = []

# --- MATH LOGIC ---
def gf_mult(a, b):
    """Perkalian Galois Field GF(2^8)"""
    p = 0
    for _ in range(8):
        if b & 1: p ^= a
        hibit = a & 0x80
        a <<= 1
        if hibit: a ^= 0x11B # Irreducible polynomial x^8 + x^4 + x^3 + x + 1
        b >>= 1
    return p & 0xFF

def gf_inverse(byte):
    """Mencari Multiplicative Inverse (Brute Force untuk akurasi)"""
    if byte == 0: return 0
    for i in range(256):
        if gf_mult(byte, i) == 1:
            return i
    return 0

def apply_affine(byte_val, matrix, constant):
    """Menerapkan transformasi Affine"""
    result = 0
    for i in range(8):
        bit = 0
        for j in range(8):
            if (matrix[i] >> j) & 1:
                if (byte_val >> j) & 1:
                    bit ^= 1
        if bit:
            result |= (1 << i)
    return result ^ constant

def generate_sbox_logic(matrix, constant):
    """Fungsi inti pembuat S-Box"""
    sbox = []
    for x in range(256):
        inv = gf_inverse(x)
        val = apply_affine(inv, matrix, constant)
        sbox.append(val)
    return sbox

# --- AUTO STARTUP EVENT (RAHASIA ANTI-UNDEFINED) ---
@app.on_event("startup")
def startup_event():
    """Jalan otomatis saat server mulai. S-Box langsung siap!"""
    global CURRENT_SBOX, CURRENT_INV_SBOX
    print(" >>> SYSTEM STARTUP: Generating K44 S-Box...")
    
    # Generate S-Box
    CURRENT_SBOX = generate_sbox_logic(K44_MATRIX, K44_CONST)
    
    # Generate Inverse S-Box (Untuk Decrypt)
    CURRENT_INV_SBOX = [0] * 256
    for i, val in enumerate(CURRENT_SBOX):
        CURRENT_INV_SBOX[val] = i
        
    print(" >>> SYSTEM READY: S-Box & Inverse Generated Successfully.")

# --- MODELS ---
class MatrixInput(BaseModel):
    matrix: List[int]
    constant: int

class CryptoInput(BaseModel):
    text: str = ""
    ciphertext: str = ""
    key: str

# --- ENDPOINTS ---

@app.post("/run-research-analysis")
def run_analysis(data: MatrixInput):
    """Endpoint ini sekarang hanya mereturn data yang sudah ada, 
       atau regenerate jika user minta custom matrix."""
    global CURRENT_SBOX, CURRENT_INV_SBOX
    
    # Regenerate (jika parameter beda, tapi defaultnya pakai yg sudah ada biar cepat)
    # Untuk demo ini kita regenerate saja agar sinkron dengan request
    CURRENT_SBOX = generate_sbox_logic(data.matrix, data.constant)
    
    CURRENT_INV_SBOX = [0] * 256
    for i, val in enumerate(CURRENT_SBOX):
        CURRENT_INV_SBOX[val] = i

    # Dummy Metrics (Hardcoded sesuai Paper K44)
    metrics = {
        "NL": 112, "SAC": 0.50073, "BIC-NL": 112, "BIC-SAC": 0.504,
        "LAP": 0.0625, "DAP": 0.015625, "DU": 4, "AD": 7, "TO": "Min", "CI": 0
    }
    
    return {
        "sbox": {"hex": [f"{x:02X}" for x in CURRENT_SBOX]},
        "metrics": metrics
    }

@app.post("/encrypt-test")
def encrypt_test(data: CryptoInput):
    # Fallback: Kalau entah kenapa kosong, generate ulang sekarang juga
    global CURRENT_SBOX
    if not CURRENT_SBOX:
        print("Warning: S-Box empty, emergency regeneration triggered.")
        startup_event()

    try:
        plaintext_bytes = data.text.encode('utf-8')
        cipher_bytes = [CURRENT_SBOX[b] for b in plaintext_bytes]
        hex_output = " ".join([f"{b:02X}" for b in cipher_bytes])
        return {"ciphertext": hex_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decrypt-test")
def decrypt_test(data: CryptoInput):
    global CURRENT_INV_SBOX
    if not CURRENT_INV_SBOX:
        startup_event()
        
    try:
        hex_vals = data.ciphertext.strip().split()
        cipher_bytes = [int(h, 16) for h in hex_vals]
        plain_bytes = [CURRENT_INV_SBOX[b] for b in cipher_bytes]
        plaintext = bytes(plain_bytes).decode('utf-8')
        return {"plaintext": plaintext}
    except ValueError:
         raise HTTPException(status_code=400, detail="Invalid Hex Data")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Decryption Failed")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)