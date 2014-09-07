var Icons = require('gulp-svg-icons');

var icons = new Icons('./node_modules/open-iconic/svg', {
  prefix: 'oci-Icon-',
  style: function(name) {
    return 'oci-Icon oci-Icon--' + name;
  }
});

module.exports = icons;
