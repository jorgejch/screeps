module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    const config = require('./.screeps.json')
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true,
                presets: ["react", "es2015", "stage-2"]
            },
            dist: {
                files: [{
                    expand: true,
                    src: ['src/**/*.js'],
                    dest: 'lib',
                    ext: '.js',
                    extDot:'last'
                }]
            }
        },
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                src: ['lib/src/*.js']
            }
        },
    });

    grunt.registerTask("transpileAndDeploy", "Transpile with babel and deploy to screeps", ["babel", "screeps"])
};
