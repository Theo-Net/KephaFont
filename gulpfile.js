/**
 * gulpfile
 */

// Les modules
var gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    rimraf       = require('rimraf'), 
    iconfont     = require('gulp-iconfont'),
    iconfontCss  = require('gulp-iconfont-css') ;

var onError = function (err) {
  console.log(err) ; 
}

// Clean
gulp.task('clean', function (cb) {

 rimraf('dist', cb) ; 
}) ; 

// Iconfont
gulp.task('build', ['clean'], function () {

  return gulp.src('src/svg/*.svg')
             .pipe(plumber({
                errorHandler: onError
             }))
             // Les paths sont relatifs à gulp.dest
             .pipe(iconfontCss({
               fontName:   'KephaFont',
               path:       'src/icons.less', 
               targetPath: '../iconFont.less',
               fontPath:   './' 
             }))
             .pipe(iconfont({
               fontName:  'KephaFont',
               formats: ['ttf', 'eot', 'woff', 'woff2'],
               normalize: true,
               metadata: 'Grégoire Oliveira Silva. ' 
                       + 'Licensed under the Creative Common By 4.0'
             }))
             .pipe(gulp.dest('dist/font')) ; 
}) ; 


