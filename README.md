# STICs Website V2

## Quick Start

~~~~
$ npm install
$ npm run watch-scss
~~~~

Styles are being preprocessed from `scss/main.scss` into `css/main.css`

## Full Guide

### Build SCSS to CSS

This website is developed using Sass. Styles must be edited in `./scss/main.scss`. Run this command build the scss file into `./css/main.css` which is the one actually referenced by the website files. This command will build the Sass only once, and `3b` will probably be a more useful command.

`$ npm run build-scss`

### Watch SCSS for changes to build CSS

The best way to continuosly edit the styles for this website is to run this command in another terminal while serving the website to continually watch for changes in the `scss/main.scss` file, rebuilding `css/main.css`whenever a change is seen.

`$ npm run watch-scss`
