
const archiver = require('archiver')
const path = require('path')
const fs = require("fs")


buildOffLineZip()


function buildOffLineZip() {

  var __dirname = path.resolve();


  var output = fs.createWriteStream('./dst/campus-cdn.zip');
  var archive = archiver('zip', {
    zlib: { level: 0 } // Sets the compression level.
  });


  // listen for all archive data to be written
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
      console.error(err)
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    console.log(JSON.stringify(err))
    throw err;
  });


  archive.pipe(output);

  console.log(__dirname)

  archive.directory('dst/.temp/css', 'css');
  archive.directory('dst/.temp/img', 'img');
  archive.directory('dst/.temp/js', 'js');
  archive.directory('dst/.temp/lib', 'lib');

  archive.finalize();

}