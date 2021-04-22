const path = require('path');

module.exports = {
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        modules: ['node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'css'],
        alias: {
          ...config.resolve.alias,
          '@src': path.resolve(__dirname, 'src')
        }
      },
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            exclude: '/node_modules/',
            test: /\.ts|\.js/,
            use: 'babel-loader',
          }
        ]
      },
    }
  },
  devServer: (configFunction) => {
    return (_proxy = {}, allowedHost) => {
      const proxy = {
        ..._proxy,
        '/socket.io': {
          target: 'http://localhost:4000',
          ws: true
        }
      }
      const config = configFunction(proxy, allowedHost);

      return {
        ...config,
        setup: require('./socketServer')
      }
    }
  }
}
