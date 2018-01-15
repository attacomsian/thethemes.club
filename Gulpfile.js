var gulp = require('gulp');
var shell = require('gulp-shell');
var minifyHTML = require('gulp-minify-html');
var uncss = require('gulp-uncss');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var jpegtran = require('imagemin-jpegtran');
var gifsicle = require('imagemin-gifsicle');
var optipng = require('imagemin-optipng');
var replace = require('gulp-replace');
var fs = require('fs');
var request = require('request')
var download = require('gulp-download');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var del = require('del');

// run jekyll in development mode
gulp.task('jekyll', function () {
    process.env.JEKYLL_ENV = 'development';
    return gulp.src('index.md', {read: false})
        .pipe(shell([
            'bundle exec jekyll build'
        ]));
});

// run jekyll in production mode
gulp.task('jekyll-prod', function () {
    process.env.JEKYLL_ENV = 'production';
    return gulp.src('index.md', {read: false})
        .pipe(shell([
            'bundle exec jekyll build'
        ]));
});

// optimize javascript
gulp.task('javascript', function () {
    return gulp.src(['_site/assets/js/bundle.min.js', '_site/assets/js/app.js'])
        .pipe(uglify())
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('_site/assets/js/'));
});

// optimize images
gulp.task('images', function () {
    return gulp.src('_site/assets/img/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant(), jpegtran(), optipng(), gifsicle()]
        }))
        .pipe(gulp.dest('_site/assets/img/'));
});

// optimize css
gulp.task('css', function () {
    return gulp.src('_site/assets/css/bootstrap.min.css')
        .pipe(uncss({
            html: ['_site/**/*.html'],
            ignore: []
        }))
        .pipe(minifyCss({keepBreaks: false}))
        .pipe(gulp.dest('_site/assets/css/'));
});

// optimize html
gulp.task('html', function () {
    return gulp.src('_site/**/*.html')
        .pipe(minifyHTML({
            quotes: true
        }))
        .pipe(replace(/<link href=\"\/assets\/css\/bootstrap.min.css\"[^>]*>/, function (s) {
            var style = fs.readFileSync('_site/assets/css/bootstrap.min.css', 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe(gulp.dest('_site/'));
});

// remove extra files
gulp.task('clean', function () {
    return del([
        // remove extra js files
        '_site/assets/js/app.js',
        '_site/assets/js/bundle.min.js',
        // remove extra css files
        '_site/assets/css/style.css', /* TODO: remove css folder too*/
        // remove javascript/*
        '_site/assets/javascript',
        // remove all current files from docs
        'docs/*'
    ]);
});

// optimize copy files from _site to docs
gulp.task('copy', function () {
    return gulp.src('_site/**')
        .pipe(gulp.dest('docs/'));
});

//inform search engine about changes
gulp.task('seo', function (cb) {
    request('https://www.google.com/webmasters/tools/ping?sitemap=https://thethemes.club/sitemap.xml');
    request('https://www.bing.com/webmaster/ping.aspx?siteMap=https://thethemes.club/sitemap.xml');
    cb();
});

// build to _site
gulp.task('build', gulp.series('jekyll', 'javascript', 'images', 'css', 'html'));

//deploy to docs
gulp.task('deploy', gulp.series('jekyll-prod', 'javascript', 'images', 'css', 'html', 'clean', 'copy'));
