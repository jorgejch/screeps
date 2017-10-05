module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: 'jorgejch@gmail.com',
                password: 'j=Cbd4012',
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
