module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-mocha-test");

    var webpack = require("webpack");
    var packageInfo = require("./package.json");
    var banner = "Loquat\ncopyright (c) 2014 Susisu | MIT License\nhttps://github.com/susisu/Loquat";
    grunt.initConfig({
        "webpack": {
            "options": {
                "entry": "./lib/loquat.js",
                "output": {
                    "path": "./build",
                    "library": "lq",
                    "sourcePrefix": "    "
                }
            },
            "browser": {
                "output": {
                    "filename": "loquat." + packageInfo.version + ".js",
                    "libraryTarget": "this"
                },
                "plugins": [
                    new webpack.BannerPlugin(
                        banner,
                        { "entryOnly": true }
                    )
                ]
            },
            "browser-min": {
                "output": {
                    "filename": "loquat." + packageInfo.version + ".min.js",
                    "libraryTarget": "this"
                },
                "plugins": [
                    new webpack.optimize.UglifyJsPlugin(),
                    new webpack.BannerPlugin(
                        banner,
                        { "entryOnly": true }
                    )
                ]
            }
        },
        "mochaTest": {
            "test": {
                "src": "./test/loquat.js"
            }
        }
    });

    grunt.registerTask("browser", ["webpack:browser"]);
    grunt.registerTask("browser-min", ["webpack:browser-min"]);
    grunt.registerTask("test", ["mochaTest:test"]);

    grunt.registerTask("default", ["browser", "browser-min"]);
};
