import {bind, config} from '@loopback/context';
import S3 from 'aws-sdk/clients/s3';
import AWS from 'aws-sdk';
import {v4 as uuid} from 'uuid';
import path from 'path';
import {ConfigBindings} from '../../keys';

@bind()
export class S3AWSService {
  private s3: S3;

  constructor(
    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'awsBucketName',
    })
    private awsBucketName: string,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'awsAccessKey',
    })
    private awsAccessKey: string,

    @config({
      fromBinding: ConfigBindings.APP_CONFIG,
      propertyPath: 'awsSecretKey',
    })
    private awsSecretKey: string,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY, //this.awsAccessKey,
      secretAccessKey: process.env.AWS_SECRET_KEY, //this.awsSecretKey,
    });
  }

  public async uploadFile(values: {
    folderName: string;
    fileName: string;
    body: Buffer | Uint8Array | Blob | string;
    isPublic?: boolean;
  }): Promise<S3.Types.ManagedUpload.SendData> {
    const {folderName, fileName, body, isPublic} = values;
    const ext = path.extname(fileName);
    return this.s3
      .upload({
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Key: `${folderName}/${uuid()}${ext}`,
        Body: body,
        ACL: isPublic ? 'public-read' : undefined,
      })
      .promise();
  }

  public async downloadFile(folderName: string, name: string) {
    return this.s3
      .getObject({
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Key: `${folderName}/${name}`,
      })
      .createReadStream();
  }

  public async removeFile(
    location: string,
  ): Promise<AWS.Request<S3.DeleteObjectOutput, AWS.AWSError>> {
    return this.s3.deleteObject({
      Bucket: String(process.env.AWS_BUCKET_NAME),
      Key: location,
    });
  }
}
