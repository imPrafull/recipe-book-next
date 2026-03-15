const fs = require('fs');
fs.cpSync('temp-app', '.', {recursive: true});
fs.rmSync('temp-app', {recursive: true, force: true});
