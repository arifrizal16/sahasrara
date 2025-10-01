// PIN Manager untuk menyimpan dan mengelola PIN
// Di production, sebaiknya simpan di database atau file system yang persistent

class PinManager {
  private static instance: PinManager
  private currentPin: string

  private constructor() {
    // Initialize PIN dari environment variable atau default
    this.currentPin = process.env.SAHASRARA_PIN || "1234"
  }

  public static getInstance(): PinManager {
    if (!PinManager.instance) {
      PinManager.instance = new PinManager()
    }
    return PinManager.instance
  }

  public getCurrentPin(): string {
    return this.currentPin
  }

  public verifyPin(inputPin: string): boolean {
    return inputPin === this.currentPin
  }

  public changePin(currentPin: string, newPin: string): { success: boolean; error?: string } {
    // Validasi format PIN
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'PIN harus 4 digit angka' }
    }

    // Verifikasi PIN saat ini
    if (currentPin !== this.currentPin) {
      return { success: false, error: 'PIN saat ini salah' }
    }

    // Cek jika PIN baru sama dengan PIN lama
    if (currentPin === newPin) {
      return { success: false, error: 'PIN baru tidak boleh sama dengan PIN saat ini' }
    }

    // Update PIN
    this.currentPin = newPin
    return { success: true }
  }

  public resetToDefault(): void {
    this.currentPin = process.env.SAHASRARA_PIN || "1234"
  }

  // Untuk debugging - jangan gunakan di production
  public getPinInfo(): string {
    return `Current PIN: ${this.currentPin.slice(0, 2)}**`
  }
}

export default PinManager
export const pinManager = PinManager.getInstance()