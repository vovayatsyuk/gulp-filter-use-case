var gulp    = require('gulp'),
    filter  = require('gulp-filter'),
    size    = require('gulp-filesize'),
    rimraf  = require('rimraf'),
    fs      = require('fs');

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

// run this command manually to create fixture folder
gulp.task('create-sources', function(cb) {
    var rootFoldersCount = 5,
        filesCount       = 30,
        rootFolderName   = 'sources',
        nesting          = 5;

    rimraf(rootFolderName, function() {
        fs.mkdirSync(rootFolderName);
        for (var i = 0; i < rootFoldersCount; i++) {
            var path = rootFolderName + '/folder-' + i;
            fs.mkdirSync(path);
            for (var j = 0; j < nesting; j++) {
                path += '/folder-' + j;
                fs.mkdirSync(path);
            }
            for (var k = 0; k < filesCount; k++) {
                fs.openSync(path + '/file' + k + '.txt', 'w');
            }
        }
        walk('sources', function(err, sources) {
            console.log('Done. Source files count: ' + sources.length);
        });
        cb();
    });
});

gulp.task('cleanup', function(cb) {
    rimraf('output', cb);
});

gulp.task('copy', ['cleanup'], function(cb) {
    var gulpFilter = filter('*.hello');
    return gulp.src(['sources/**/*'])
        .pipe(gulpFilter)
        .pipe(gulpFilter.restore())
        // .pipe(size())
        .pipe(gulp.dest('output'));
});

gulp.task('compare', ['copy'], function() {
    walk('sources', function(err, sources) {
        walk('output', function(err, output) {
            console.log('source files: ' + sources.length);
            console.log('output files: ' + output.length);
        });
    });
});

gulp.task('default', ['compare']);
