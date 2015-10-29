var
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    rename = require('gulp-rename'),
    csso = require('gulp-csso'),
    concatCss = require('gulp-concat-css'),
    concat = require("gulp-concat"),
    imagemin = require('gulp-imagemin'),
    connect = require('gulp-connect'),
    merge = require('merge-stream'),
    es = require('event-stream');



gulp.task('jade', function() {
    gulp.src(['./assets/template/*.jade', '!./assets/template/_*.jade'])
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log)
        .pipe(gulp.dest('./'));
});

gulp.task('js', function() {
    gulp.src(['./assets/js/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/js/'));
});

function styl() {
    return gulp.src('./assets/stylus/*.styl')
        .pipe(stylus({
            use: nib(),
            import: ['nib']
        }));
}

function rest() {
    return gulp.src('./assets/css/**/*');
}

gulp.task('csso', function() {
    return es.merge(styl(), rest())
        .pipe(csso())
        .pipe(concatCss("index.css"))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('default', ['csso', 'jade','js'], function() {
    gulp.watch('assets/template/**/*.jade', ['jade']);
    gulp.watch('assets/js/**/*', ['js']);
    gulp.watch(['assets/css/**/*', 'assets/stylus/*.styl'], ['csso']);
});
