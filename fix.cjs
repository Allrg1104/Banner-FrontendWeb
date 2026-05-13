const fs = require('fs');
let code = fs.readFileSync('e:/Users/Project/Banner-FrontendWeb/views/registro.js', 'utf8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('e:/Users/Project/Banner-FrontendWeb/views/registro.js', code);
console.log('Fixed syntax errors');
