import path from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const shouldAnalyze = env && env.analyze;

  return {
    mode: argv.mode || 'development',
    entry: {
      // Background script
      'background/service-worker': './extension/background/service-worker.js',

      // Content scripts
      'content/ultimate-content-script': './extension/content/ultimate-content-script.js',
      'content/advanced-content-script': './extension/content/advanced-content-script.js',
      'content/content-script': './extension/content/content-script.js',

      // Popup and options
      'popup/popup': './extension/popup/popup.js',
      'options/options': './extension/options/options.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    chrome: '88'
                  }
                }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          // Copy manifest
          {
            from: 'extension/manifest.json',
            to: 'manifest.json',
            transform(content) {
              // Optionally modify manifest for production
              const manifest = JSON.parse(content);
              if (isProduction) {
                // Remove unnecessary permissions for production if needed
                manifest.content_security_policy = {
                  extension_pages: "script-src 'self'; object-src 'self'"
                };
              }
              return JSON.stringify(manifest, null, 2);
            }
          },

          // Copy HTML files
          { from: 'extension/popup/popup.html', to: 'popup/popup.html' },
          { from: 'extension/options/options.html', to: 'options/options.html' },

          // Copy CSS files
          { from: 'extension/popup/popup.css', to: 'popup/popup.css' },
          { from: 'extension/options/options.css', to: 'options/options.css' },
          { from: 'extension/styles', to: 'styles' },

          // Copy assets
          { from: 'extension/assets', to: 'assets' },

          // Copy services (they use dynamic imports)
          { from: 'extension/services', to: 'services' },

          // Copy components
          { from: 'extension/components', to: 'components' },

          // Copy utils
          { from: 'extension/utils', to: 'utils' },
        ],
      }),

      // Bundle analyzer (only when --env.analyze is passed)
      ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
    ],
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    },
    devtool: isProduction ? false : 'inline-source-map',
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },
  };
};
