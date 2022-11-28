import {inject} from '@loopback/core';
import {FileUploadHandler, FILE_UPLOAD_SERVICE} from '../../keys';
import {Request, Response} from '@loopback/rest';

export interface FileField {
  files: Express.Multer.File[];
  fields: object;
  body: object;
}

export class FileHandler {
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) {}

  public async uploadFilesWithBody(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any,
  ): Promise<FileField> {
    return new Promise<FileField>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.handler(request, response, (err: any) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve({
            files: request.files as Express.Multer.File[],
            fields: request.fields ?? {},
            body: request.body ?? {},
          });
        }
      });
    });
  }
}
