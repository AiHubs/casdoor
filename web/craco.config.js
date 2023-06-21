const CracoLessPlugin = require("craco-less");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig, {env}) => {
      if (env === "production") {
        webpackConfig.devtool = false;
        // Split chunks to separate vendor dependencies from application code
        webpackConfig.optimization.splitChunks = {
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: -10,
              enforce: true,
            },
            antdTokenPreviewer: {
              test: /[\\/]node_modules[\\/](antd-token-previewer)[\\/]/,
              name: "antd-token-previewer",
              chunks: "all",
              priority: -5,
              enforce: true,
            },
            codeMirror: {
              test: /[\\/]node_modules[\\/](codemirror)[\\/]/,
              name: "codemirror",
              chunks: "all",
              priority: -5,
              enforce: true,
            },
          },
        };

        // Enable tree shaking
        webpackConfig.optimization.usedExports = true;

        // Enable minification and compression
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
              },
            },
          }),
        ];
      }

      return webpackConfig;
    },
  },
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/swagger": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/files": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/.well-known/openid-configuration": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/cas/serviceValidate": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/cas/proxyValidate": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/cas/proxy": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/cas/validate": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {"@primary-color": "rgb(89,54,213)", "@border-radius-base": "5px"},
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
