const BundleTracker = require('webpack-bundle-tracker');

const exp = {
  publicPath: 'http://127.0.0.1:8080/',
  // outputDir: './dist/',
  transpileDependencies: ['vuetify'],

  chainWebpack: config => {
    config
      .plugin('BundleTracker')
      .use(BundleTracker, [{ filename: './webpack-stats.json' }]);

    config.output.filename('bundle.[hash].js');

    config.optimization.splitChunks(false);

    config.resolve.alias.set('__STATIC__', 'static');

    config.devServer
      // the first 3 lines of the following code have been added to the configuration
      .public('http://127.0.0.1:8080')
      .host('127.0.0.1')
      .port(8080)
      .hotOnly(true)
      .watchOptions({ poll: 1000 })
      .https(false)
      .disableHostCheck(true)
      .headers({ 'Access-Control-Allow-Origin': ['*'] });

    if (process.env.NODE_ENV === 'production') {
      config.plugin('html')
        .tap(args => {
          args[0].title = 'LoadNinja';
          args[0].scriptLoading = 'defer';
          args[0].inject = false;
          args[0].hash = true;
          return args;
        })
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  exp.publicPath = '/static/';
  exp.css = {
    extract: {
      filename: 'bundle.[hash].css',
      chunkFilename: '[name].[hash].css',
      publicPath: '/static/'
    }
  };

  // Service worker
  exp.pwa = {
    name: 'LoadNinja',
    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: 'src/firebase-messaging-sw.js'
      // ...other Workbox options...
    }
  };

  exp.configureWebpack = {
    devtool: ''
  };
}

module.exports = { ...exp };
