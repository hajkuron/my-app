module.exports = {
  // ...other config
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn' // changes it to warning instead of error
    // OR
    '@typescript-eslint/no-unused-vars': ['error', { 
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_'
    }] // ignores variables/parameters that start with underscore
  }
} 