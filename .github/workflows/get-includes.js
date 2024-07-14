var fs = require('fs');
console.log(JSON.parse(fs.readFileSync('./build.json', 'utf8')).includes.join(" "));