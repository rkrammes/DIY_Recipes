export default {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      // Always transform modules to CommonJS for Jest compatibility
      modules: 'commonjs'
    }]
  ]
};