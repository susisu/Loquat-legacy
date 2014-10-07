module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-mocha-test");

    var webpack = require("webpack");
    var packageInfo = require("./package.json");

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
            },
            "browser-min": {
                "output": {
                    "filename": "loquat." + packageInfo.version + ".min.js",
                    "libraryTarget": "this"
                },
                "plugins": [new webpack.optimize.UglifyJsPlugin()]
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
