import { generate } from "generate-password";


const passwordOptions = {
  length: 12, // Length of the password
  numbers: true, // Include numbers
  symbols: true, // Include symbols
  uppercase: true, // Include uppercase letters
  excludeSimilarCharacters: true, // Exclude similar characters (e.g., 'i', 'l', '1', 'L')
};

export function generatePasswordFun() {
  const password = generate(passwordOptions);
  return password;
}