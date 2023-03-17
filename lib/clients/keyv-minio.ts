import { EventEmitter } from 'events';
import Keyv from 'keyv';
import { isEmpty } from 'lodash';
import { getLogger } from 'log4js';
import { Client, ClientOptions } from 'minio';

import { Config } from '@/types';

const logger = getLogger('keyv-minio');

export class KeyvMinio extends EventEmitter implements Keyv.Store<string> {
  private client: Client;

  constructor(private readonly bucketName: string, private readonly minioOptions: ClientOptions) {
    super();

    if (isEmpty(this.bucketName)) {
      const err = new Error('invalid bucket name');
      this.emit('error', err);
      throw err;
    }

    this.client = new Client(minioOptions);
    this.getBucketIfExists(this.bucketName);
  }

  public async get(key: string): Promise<string | undefined> {
    try {
      const objectStream = await this.client.getObject(this.bucketName, this.getKeyName(key));

      // https://github.com/nodejs/readable-stream/issues/403#issuecomment-479069043
      const chunks = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of objectStream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks).toString();
    } catch (e) {
      if (e.code !== 'NoSuchKey') {
        logger.warn('Error getting key', e);
      }
      return undefined;
    }
  }

  public async set(key: string, value: string): Promise<boolean> {
    try {
      await this.client.putObject(this.bucketName, this.getKeyName(key), value, {
        'Content-Type': 'application/json',
      });
      return true;
    } catch (e) {
      logger.error('Error setting key', e);
      this.emit('error', e);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucketName, this.getKeyName(key));
      return true;
    } catch (e) {
      logger.error('Error deleting key', e);
      this.emit('error', e);
      return false;
    }
  }

  public async clear(): Promise<void> {
    // TODO
  }

  private getKeyName(key: string) {
    return `${key}.json`;
  }

  private async getBucketIfExists(bucket: string): Promise<string> {
    const bucketName = bucket;
    const exist = await this.client.bucketExists(bucketName);
    if (!exist) {
      await this.client.makeBucket(bucketName, this.minioOptions.region || 'us-west-2');
    }
    return bucketName;
  }
}

const KeyvMinioClient = ({ BUCKET_NAME, MINIO_OPTIONS }: Config) => new KeyvMinio(BUCKET_NAME!, MINIO_OPTIONS);

export default KeyvMinioClient;
