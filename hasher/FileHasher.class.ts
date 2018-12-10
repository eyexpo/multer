import * as crypto from 'crypto';

export class FileHasher {

  public static readonly BLOCK_SIZE: number = 4 * 1024 * 1024;

  constructor(public _overallHasher: any, public _blockHasher: any, public  _blockPos: any) {
  }

  public static create = () => {
    return new FileHasher(crypto.createHash('sha256'), crypto.createHash('sha256'), 0);
  };

  /**
   *
   * @param dta  Buffer of Data
   * @param inputEncoding  UTF or ASCII or LATIN1
   */
  public update = (dta: Buffer, inputEncoding: null | string = null) => {
    let data = dta;
    try {
      if (this._overallHasher === null) {
        throw new Error(
          'can\'t use this object anymore; you already called digest()');
      }

      // if data is not a buffer, we have an error
      if (!Buffer.isBuffer(data)) {
        if (inputEncoding !== undefined &&
          inputEncoding !== 'utf8' && inputEncoding !== 'ascii' && inputEncoding !== 'latin1') {
          // The docs for the standard hashers say they only accept these three encodings.
          throw new Error(`Invalid \'inputEncoding\': ${JSON.stringify(inputEncoding)}`);
        }
        data = Buffer.from(data, inputEncoding);
      }

      // Take in the new data, and update filehashers position in the file
      // create a new hash when the data is >= the BLOCK SIZE
      let offset = 0;
      while (offset < data.length) {
        if (this._blockPos === FileHasher.BLOCK_SIZE) {
          this._overallHasher.update(this._blockHasher.digest());
          this._blockHasher = crypto.createHash('sha256');
          this._blockPos = 0;
        }

        const spaceInBlock = FileHasher.BLOCK_SIZE - this._blockPos;
        const inputPartEnd = Math.min(data.length, offset + spaceInBlock);
        const inputPartLength = inputPartEnd - offset;
        this._blockHasher.update(data.slice(offset, inputPartEnd));

        this._blockPos += inputPartLength;
        offset = inputPartEnd;
      }
    } catch (err) {
      console.error('[ERROR] ', err);
    }
  }

  /**
   * completes the final hash
   * @param encoding
   */
  public digest = (encoding: string) => {
    try {
      if (this._overallHasher === null) {
        throw new Error(
          'can\'t use this object anymore; you already called digest()');
      }

      if (this._blockPos > 0) {
        this._overallHasher.update(this._blockHasher.digest());
        this._blockHasher = null;
      }
      const r = this._overallHasher.digest(encoding);
      this._overallHasher = null;  // Make sure we can't use this object anymore.
      return r;
    } catch (err) {
      console.error('[ERROR] ', err);
    }
  }
}
