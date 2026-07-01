// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * HTTP status codes and other numeric constants that are always self-explanatory
 * and are allowed in no-magic-numbers rule.
 */
const ALLOWED_NUMBERS = [
  0, 1, -1, 2,
  // HTTP status codes
  200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503,
];

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],

    rules: {
      // ── Magic numbers ──────────────────────────────────────────────────────
      'no-magic-numbers': [
        'warn',
        {
          ignore: ALLOWED_NUMBERS,
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          enforceConst: true,
        },
      ],

      // ── Naming: min length 2, allow classic loop vars and _ prefix ─────────
      'id-length': [
        'warn',
        {
          min: 2,
          exceptions: ['_', 'i', 'j', 'k', 'x', 'y'],
          properties: 'never',
        },
      ],

      // ── TypeScript naming conventions ──────────────────────────────────────
      '@typescript-eslint/naming-convention': [
        'warn',
        // Interfaces — PascalCase, no "I" prefix
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        // Type aliases — PascalCase
        { selector: 'typeAlias', format: ['PascalCase'] },
        // Classes — PascalCase
        { selector: 'class', format: ['PascalCase'] },
        // Constants — UPPER_CASE or camelCase
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
        },
        // General variables — camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Parameters — camelCase
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Class members — camelCase
        {
          selector: 'memberLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // ── General quality rules ──────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },

  // Test files get slightly relaxed rules — fixtures and specs
  // often need more numeric literals (timeouts, counts, indices).
  {
    files: ['tests/**/*.spec.ts', 'src/fixtures/**/*.ts'],
    rules: {
      'no-magic-numbers': [
        'warn',
        {
          ignore: [...ALLOWED_NUMBERS, 3, 5, 10, 20, 30, 60, 100, 1000, 3000, 5000, 10000, 30000],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
    },
  },
);
