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
        shallowClone: true
      },
      prod: {
        servers: ['pi@192.168.0.30']
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');
  grunt.loadNpmTasks('shipit-deploy');

  grunt.shipit.remote('forever stop app.js', function (err, res) {
    console.log("STOP");
    console.log(res.stdout, res.stderr);
  });

  grunt.shipit.remote('forever start app.js', function (err, res) {
    console.log("START");
    console.log(res.stdout, res.stderr);
  });

};
