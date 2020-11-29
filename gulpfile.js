"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
const rigger = require("gulp-include");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const concat = require("concat");
const concatCss = require("gulp-concat-css");
const del = require("del");
const browsersync = require("browser-sync").create();
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');


/* Paths */
var path = {
    build: {
        html: "dist/",
        js: "dist/assets/js/",
        css: "dist/assets/css/",
        csslibs: "dist/assets/css/",
        images: "dist/assets/img/",
        fonts: "dist/assets/fonts/"
    },
    src: {
        html: "src/*.html",
        js: "src/assets/js/*.js",
        csslibs: "src/assets/sass/libs/**/*.css",
        css: "src/assets/sass/style.sass",
        images: "src/assets/img/**/*",
        fonts: "src/assets/fonts/**/*"
    },
    watch: {
        html: "src/**/*.html",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.sass",
        csslibs: "src/assets/sass/libs/**/*.css",
        images: "src/assets/img/**/*",
        fonts: "src/assets/fonts/**/*"
    },
    clean: "./dist"
}




/* Tasks */
function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3000
    });
}
function browserSyncReload() {
    browsersync.reload();
}

function deploy(){
    var conn = ftp.create({
        host:      '127.0.0.1',
        user:      'test',
        password:  'password__here',
        parallel:  10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('/your/path/to/directory'));
}

function html() {
    return src(path.src.html, { base: "src/" })
        .pipe(plumber())
        .pipe(rigger())
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }));
}
function htacces() {
    return src('src/.htaccess')
        .pipe(dest('dist/'))
        .pipe(browsersync.reload({ stream: true }));
}
function css() {
    return src(path.src.css, { base: "src/assets/sass/" })
        .pipe(plumber())
        .pipe(sass())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.reload({ stream: true }));

}
function csslibs() {
    return src(path.src.csslibs)
        .pipe(concatCss('libs.css'))
        .pipe(plumber())
        .pipe(dest(path.build.csslibs))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.csslibs))
        .pipe(browsersync.reload({ stream: true }));
}
function fonts() {
    return src([
        path.src.fonts,
        'node_modules/simple-line-icons/fonts/**'
    ])
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.reload({ stream: true }));
}
function js() {
    return src(path.src.js, {base: './src/assets/js/'})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.reload({ stream: true }));
}

function images() {
    return src(path.src.images)
        .pipe(imagemin())
        .pipe(dest(path.build.images))
        .pipe(browsersync.reload({ stream: true }));

}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.csslibs], csslibs);
    gulp.watch([path.watch.fonts], fonts);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch(['src'], htacces);
}

const build = gulp.series(clean, gulp.parallel(browserSyncReload, htacces, html, css, js, images, csslibs, fonts));
const watch = gulp.parallel(build, browserSyncReload, watchFiles, browserSync);




/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.csslibs = csslibs;
exports.fonts = fonts;
exports.js = js;
exports.htacces = htacces;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.deploy = deploy;