module.exports = {
  devServer: {
    allowedHosts: 'all',
  },

  // yamlファイルのimport
  chainWebpack: (config) => {
    config.module
      .rule('yaml')
      .test(/\.ya?ml?$/)
      .use('json-loader')
      .loader('json-loader')
      .end()
      .use('yaml-loader')
      .loader('yaml-loader');
  },

  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
    },
  },

  // productionSourceMap: false,
  // filenameHashing: false,
  // chainWebpack: (config) => {
  //   if (process.env.NODE_ENV === 'production') {
  //     config.output.filename('js/[name].js?[contenthash:8]');
  //     config.output.chunkFilename('js/[name].js?[contenthash:8]');
  //     config.plugin('extract-css').tap(args => {
  //       (args[0].filename = 'css/[name].css?[contenthash:8]'),
  //         (args[0].chunkFilename = 'css/[name].css?[contenthash:8]');
  //       args[0].allChunks = true;
  //       return args;
  //     });
  //   }
  // },
};
