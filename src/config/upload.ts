import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const updloadPath = path.resolve(__dirname, '../', '../', 'tmp');

export default {
  directory: updloadPath,
  storage: multer.diskStorage({
    destination: updloadPath,
    filename: (req, file, callback) => {
      const hashFileName = crypto.randomBytes(10).toString('HEX');
      const filename = `${hashFileName}-${file.originalname}`;
      callback(null, filename);
    },
  }),
};
