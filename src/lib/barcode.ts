/**
 * Utilitários para geração e validação de códigos de barras EAN-13
 */

/**
 * Gera um código EAN-13 válido
 * Formato: 789 + 9 dígitos aleatórios + 1 dígito verificador
 */
export function generateEAN13(): string {
  // Prefixo 789 (código de produto interno/não oficial)
  const prefix = '789';

  // Gerar 9 dígitos aleatórios
  let randomDigits = '';
  for (let i = 0; i < 9; i++) {
    randomDigits += Math.floor(Math.random() * 10).toString();
  }

  const baseCode = prefix + randomDigits;

  // Calcular dígito verificador
  const checkDigit = calculateEAN13CheckDigit(baseCode);

  return baseCode + checkDigit;
}

/**
 * Calcula o dígito verificador de um código EAN-13
 */
export function calculateEAN13CheckDigit(code: string): number {
  if (code.length !== 12) {
    throw new Error('Código deve ter 12 dígitos para calcular o check digit');
  }

  let sum = 0;

  // Algoritmo EAN-13: soma alternada com peso 1 e 3
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    const weight = i % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }

  // Check digit = (10 - (soma % 10)) % 10
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit;
}

/**
 * Valida se um código EAN-13 é válido
 */
export function validateEAN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) {
    return false;
  }

  const baseCode = code.substring(0, 12);
  const providedCheckDigit = parseInt(code[12]);
  const calculatedCheckDigit = calculateEAN13CheckDigit(baseCode);

  return providedCheckDigit === calculatedCheckDigit;
}

/**
 * Formata código EAN-13 para exibição
 * Exemplo: 7891234567890 -> 789 1234 56789 0
 */
export function formatEAN13(code: string): string {
  if (code.length !== 13) {
    return code;
  }

  return `${code.substring(0, 3)} ${code.substring(3, 7)} ${code.substring(7, 12)} ${code[12]}`;
}

/**
 * Gera código EAN-13 único verificando se já existe no banco
 */
export async function generateUniqueEAN13(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const code = generateEAN13();
    const exists = await checkExists(code);

    if (!exists) {
      return code;
    }

    attempts++;
  }

  throw new Error('Não foi possível gerar um código único após 100 tentativas');
}
