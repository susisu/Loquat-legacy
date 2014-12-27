var gulp    = require("gulp"),
    mocha   = require("gulp-mocha"),
    webpack = require("gulp-webpack");

var packageInfo = require("./package.json");
var banner = "Loquat\ncopyright (c) 2014 Susisu | MIT License\nhttps://github.com/susisu/Loquat";

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
                "filename": "loquat." + packageInfo.version + ".js"
            },
            "plugins": [
                new webpack.webpack.BannerPlugin(
                    banner,
                    { "entryOnly": true }
                )
            ]
        }))
        .pipe(gulp.dest("./build"));
});

gulp.task("webpack-min", function () {
    return gulp.src("./lib/loquat.js")
        .pipe(webpack({
            "output": {
                "libraryTarget": "var",
                "library": "loquat",
                "sourcePrefix": "    ",
                "filename": "loquat." + packageInfo.version + ".min.js",
            },
            "plugins": [
                new webpack.webpack.optimize.UglifyJsPlugin(),
                new webpack.webpack.BannerPlugin(
                    banner,
                    { "entryOnly": true }
                )
            ]
        }))
        .pipe(gulp.dest("./build"));
});

gulp.task("build", ["webpack", "webpack-min"]);

gulp.task("default", ["build"]);
