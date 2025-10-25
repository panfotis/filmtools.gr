let gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass-embedded')),
  sourcemaps = require('gulp-sourcemaps'),
  $ = require('gulp-load-plugins')(),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  postcssInlineSvg = require('postcss-inline-svg'),
  browserSync = require('browser-sync').create(),
  pxtorem = require('postcss-pxtorem'),
  purgecss = require('gulp-purgecss'),
  axios = require('axios'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  path = require('path'),
  postcssProcessors = [
    pxtorem({
      propList: ['font', 'font-size', 'line-height', 'letter-spacing', '*margin*', '*padding*'],
      mediaQuery: true
    })
  ];

const paths = {
  scss: {
    src: './scss/style.scss',
    dest: './css',
    watch: './scss/**/*.scss',
    bootstrap: './node_modules/bootstrap/scss/bootstrap.scss',
  },
  js: {
    bootstrap: './node_modules/bootstrap/dist/js/bootstrap.min.js',
    popper: './node_modules/@popperjs/core/dist/umd/popper.min.js',
    barrio: '../../contrib/bootstrap_barrio/js/barrio.js',
    dest: './js'
  },
  classJson: path.resolve(__dirname, './scraped-classes.json')
}

// List of URLs to scrape
const urls = [
  'https://wearedope-drupal.ddev.site',
];

// Scraping function
async function scrapeClasses(url) {
  try {
    const response = await axios.get(url, {
      httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false })  // Disable SSL verification
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const classes = [];
    $('[class]').each((index, element) => {
      const classList = $(element).attr('class').split(' ');
      classList.forEach(className => {
        if (!classes.includes(className)) {
          classes.push(className);
        }
      });
    });

    return classes;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
}

// Collect and save classes to JSON file
async function collectAndSaveClasses() {
  const allClasses = [];

  for (const url of urls) {
    const classes = await scrapeClasses(url);
    allClasses.push(...classes);
  }

  const uniqueClasses = Array.from(new Set(allClasses));
  fs.writeFileSync(paths.classJson, JSON.stringify(uniqueClasses, null, 2));
  console.log(`Saved ${uniqueClasses.length} unique classes to ${paths.classJson}`);
}

// Load safelist from JSON
function loadSafelist() {
  if (fs.existsSync(paths.classJson)) {
    return JSON.parse(fs.readFileSync(paths.classJson, 'utf8'));
  }
  return [];
}

// Gulp scrape task to save classes
gulp.task('scrape', async function () {
  await collectAndSaveClasses();
});

// Compile sass into CSS & auto-inject into browsers
function styles() {
  const safelist = loadSafelist();

  return gulp.src([paths.scss.bootstrap, paths.scss.src])
    .pipe(sourcemaps.init())
    .pipe(sass({
      silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
      includePaths: [
        './node_modules/bootstrap/scss',
        '../../contrib/bootstrap_barrio/scss'
      ]
    }).on('error', sass.logError))
    .pipe($.postcss(postcssProcessors))
    .pipe(postcss([autoprefixer({
      browsers: [
        'Chrome >= 35',
        'Firefox >= 38',
        'Edge >= 12',
        'Explorer >= 10',
        'iOS >= 8',
        'Safari >= 8',
        'Android 2.3',
        'Android >= 4',
        'Opera >= 12']
    })]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream())
}

// Purge unused CSS
// Purge unused CSS
function purge() {
  const safelist = loadSafelist();

  return gulp.src(paths.scss.dest + '/style.css')
    .pipe(purgecss({
      content: [
        './js/**/*.js',
        './scss/*.scss',
        './templates/**/*.twig',
        '../contrib/bootstrap_barrio/templates/**/*.twig'
      ],
      safelist: safelist
    }))
    .pipe(gulp.dest(paths.scss.dest));
}

// Move the javascript files into our js folder
function js() {
  return gulp.src([paths.js.bootstrap, paths.js.popper, paths.js.barrio])
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream())
}

//Static Server + watching scss/html files
function serve() {
  browserSync.init({
    proxy: 'https://wearedope-drupal.ddev.site',  // Proxy to DDEV URL
    open: false,                                 // Don't open a new tab
    https: true,                                 // Match DDEV's HTTPS setup
    notify: true,                                // Reload notification in the browser
    ghostMode: false,                            // No mirroring of clicks/scrolls
    watchOptions: {
      usePolling: true,                          // Ensure file change detection inside Docker
      interval: 300,                             // Polling interval in milliseconds
    },
    rewriteRules: [{
      match: /localhost:3030/g,
      replacement: 'https://wearedope-drupal.ddev.site'
    }],
    // You can also set baseDir here to your assets folder if necessary
    // baseDir: './public'  // Adjust according to your project structure
  });

  gulp.watch([paths.scss.watch, paths.scss.bootstrap], styles).on('change', browserSync.reload);
}

const build = gulp.series(styles, gulp.parallel(js, serve));

exports.styles = styles;
exports.js = js;
exports.serve = serve;
exports.purge = purge;

exports.default = build;


// RUN GULP AS USSUAL
// gulp
// WHEN EVERYTHING IS DONE RUN THE FOLLOWING COMMAND TO SCRAPE THE CLASSES
// gulp scrape
// gulp purge



