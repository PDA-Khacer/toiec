import {Provider} from '@loopback/core';
import {bind} from '@loopback/context';
import {config} from '@loopback/core';
import multer from 'multer';
import {FileUploadHandler} from '../../keys';

@bind()
export class FileUpload implements Provider<FileUploadHandler> {
  constructor(@config() private options: multer.Options = {}) {
    if (!this.options.storage) {
      // Default to in-memory storage
      this.options.storage = multer.memoryStorage();
    }
  }

  value(): FileUploadHandler {
    return multer(this.options).any();
  }
}
