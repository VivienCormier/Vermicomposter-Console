var pkg = require('./package.json');

module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/hello-world-workspace',
        deployTo: '/home/pi/vermicomposter-console',
        repositoryUrl: pkg.repository.url,
        ignores: ['.git', 'node_modules'],
        keepReleases: 2,
        shallowClone: true,
        npm: {
          remote: false,
          installFlags: ['--production']
        },
      },
      prod: {
        servers: ['pi@192.168.0.13']
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
  grunt.loadNpmTasks('shipit-deploy');
  grunt.loadNpmTasks('shipit-npm');
  require('shipit-npm')(grunt.shipit);

  grunt.registerTask('forever_stop', function () {
    grunt.shipit.remote('forever stop /home/pi/vermicomposter-console/current/app.js', this.async());
  });

  grunt.registerTask('npm_install', function () {
    grunt.shipit.remote('forever start /home/pi/vermicomposter-console/current/app.js', this.async());
  });

  grunt.registerTask('forever_start', function () {
    grunt.shipit.remote('forever start /home/pi/vermicomposter-console/current/app.js', this.async());
  });

  grunt.shipit.on('deploy', function () {
    grunt.task.run(['forever_stop']);
  });

  grunt.shipit.on('published', function () {
    grunt.task.run(['forever_start']);
  });

};
