var gulp    = require("gulp"),
    mocha   = require("gulp-mocha"),
    webpack = require("gulp-webpack");

var packageInfo = require("./package.json");
var banner = "Loquat " + packageInfo.version +
    "\ncopyright (c) 2014-2015 Susisu | MIT License\nhttps://github.com/susisu/Loquat";

gulp.task("test", function () {
    return gulp.src("./test/loquat.js")
        .pipe(mocha());
});

gulp.task("webpack", function () {
    return gulp.src("./lib/loquat.js")
        .pipe(webpack({
            "output": {
                "libraryTarget": "var",
                "library": "loquat",
                "sourcePrefix": "    ",
                "filename": "loquat.js"
            },
            "plugins": [
                new webpack.webpack.BannerPlugin(
                    banner,
                    { "entryOnly": true }
                )
            ]
        }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("webpack-min", function () {
    return gulp.src("./lib/loquat.js")
        .pipe(webpack({
            "output": {
                "libraryTarget": "var",
                "library": "loquat",
                "sourcePrefix": "    ",
                "filename": "loquat.min.js",
            },
            "plugins": [
                new webpack.webpack.optimize.UglifyJsPlugin(),
                new webpack.webpack.BannerPlugin(
                    banner,
                    { "entryOnly": true }
                )
            ]
        }))
        .pipe(gulp.dest("./dist"));
});

gulp.task("build", ["webpack", "webpack-min"]);

gulp.task("default", ["build"]);
