var concat = require('concat-stream')

function MemoryStorage (opts) {}

MemoryStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  file.stream.on('data', () => {
    console.log('RAM - got data chunk entry point')
  })
  file.stream.pipe(concat({ encoding: 'buffer' }, function (data) {
    console.log('RAM - stream closed entry point')
    cb(null, {
      buffer: data,
      size: data.length
    })
  }))
}

MemoryStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  delete file.buffer
  cb(null)
}

module.exports = function (opts) {
  return new MemoryStorage(opts)
}
