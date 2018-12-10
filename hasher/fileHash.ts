import * as fs from 'fs';
// const fileHasher = require('./fileHasher');
import { FileHasher } from './FileHasher.class';

let RamHasher: any;
let DiskHasher: any;
/**
 * Take a path and file from disk, read the file in 8k chunks,
 * calculate and return the 32 character SHA256 hash
 * @param filename
 */
export const fileHash = (filename: string): Promise<string> => {

  return new Promise((resolve, reject) => {

    DiskHasher = FileHasher.create();

    const f = fs.createReadStream(filename);
    f.on('data',  (buf) => {
      DiskHasher.update(buf);
    });
    f.on('end',  (err) => {
      const hexDigest = DiskHasher.digest('hex');
      let result;
      // console.log(hexDigest);
      // console.log(hexDigest.length);
      if (!err) {
        result = resolve(hexDigest);
      } else {
        result = reject('Error');
      }
      return result;
    });
    f.on('error',  (err) => {
      // TODO decide on error handling
      // TODO fileHash and bufferHash should return errors to
      // TODO processReceivedFile so it can move it to the
      // TODO rejectedFiles list
      // allow the upstream to reject the file
      console.error(`Error reading from file: ${err}`);
    });

  });
};

/**
 * Take a file buffer and return a SHA256 hash
 * @param file
 * @constructor
 */
export const BufferHash = (file: Buffer): Promise<string> => {

  return new Promise((resolve, reject) => {

    RamHasher = FileHasher.create();

    RamHasher.update(file);
    const hexDigest = RamHasher.digest('hex');
      // console.log('hash:', hexDigest);
      // console.log('length:', hexDigest.length);
    return resolve(hexDigest);
  });
};


