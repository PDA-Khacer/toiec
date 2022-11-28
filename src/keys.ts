import {BindingKey} from '@loopback/context';
import {AppConfig} from './application/app-config';
import {InfraConfig} from './infrastructure/infra-config';
import {DbDatasource} from './infrastructure/datasources';
import {RequestHandler} from 'express-serve-static-core';

export type FileUploadHandler = RequestHandler;

export namespace DataSourceBindings {
  export const DATASOURCE_DB =
    BindingKey.create<DbDatasource>('datasources.db');
}

export namespace ConfigBindings {
  export const APP_CONFIG = BindingKey.create<AppConfig>('config.app_config');
  export const INFRA_CONFIG = BindingKey.create<InfraConfig>(
    'config.infra_config',
  );
}

export const FILE_UPLOAD_SERVICE = BindingKey.create<FileUploadHandler>(
  'services.FileUpload',
);
