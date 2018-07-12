module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
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
                    ext: '.js'
                }]
            }
        },
        screeps: {
            options: {
                email: 'jorgejch@gmail.com',
                password: 'j=Cbd4012',
                branch: 'default',
                // branch: 'tutorial-1',
                ptr: false
            },
            dist: {
                src: ['lib/src/*.js']
            }
        },
    });

    grunt.registerTask("transpileAndDeploy", "Transpile with babel and deploy to screeps", ["babel", "screeps"])
};
