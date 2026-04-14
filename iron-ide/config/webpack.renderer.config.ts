import path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  mode: 'development',
  target: 'web',
  entry: './src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist/renderer'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@shared': path.resolve(__dirname, '../src/shared'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // HTML plugin will be added dynamically if needed
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '../public'),
    },
    hot: true,
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  devtool: 'inline-source-map',
};

export default config;
