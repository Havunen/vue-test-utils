module.exports = {
  moduleNameMapper: {
    '^~(.*)$': '<rootDir>/test/$1',
    '^packages/(.*)$': '<rootDir>/packages/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node']
  },
  'moduleFileExtensions': ['js', 'json', 'vue'],
  transform: {
    '.*\\.(vue)$': '@vue/vue2-jest',
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  }
}
