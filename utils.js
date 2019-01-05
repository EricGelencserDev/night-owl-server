const path = require('path');
const fs = require('fs');

//
// Get all './js' files from a directory and return an array
// of objects with the filename, and the export from the module
//
module.exports.requireDir = (requirePath) => {

    // User all js files in the CONTROLLER_DIR as express routers (filename is route)
    const files = fs.readdirSync(requirePath).filter(filename => (path.extname(filename) === '.js'));
    let imports = files.map(filename => {
        return {
            filename: filename,
            exports: require(`${requirePath}/${filename}`)
        }
    });
    return imports
};