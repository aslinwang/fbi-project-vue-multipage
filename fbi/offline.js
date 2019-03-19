
const archiver = require('archiver')
const path = require('path')
const fs = require("fs")


buildOffLineZip()


function buildOffLineZip() {

  var __dirname = path.resolve();


  var output = fs.createWriteStream('./dst/campus-offline.zip');
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

  const __CDN__ = `sqimg.qq.com/qq_product_operations/tiqq/campus/`

  archive.directory('dst/.temp/css', __CDN__ + 'css');
  archive.directory('dst/.temp/img', __CDN__ + 'img');
  archive.directory('dst/.temp/js', __CDN__ + 'js');
  archive.directory('dst/.temp/lib', __CDN__ + 'lib');


  archive.finalize();

}