const path = require('path');

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: './src/components/MyComponent.tsx', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file name
    library: 'MyComponent', // Library name
    libraryTarget: 'umd', // Library target
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'], // File extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Transpile .ts and .tsx files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use babel-loader
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'], // Use presets from .babelrc
          },
        },
      },
    ],
  },
};
