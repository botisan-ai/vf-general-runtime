import { expect } from 'chai';
import sinon from 'sinon';

import KeyvMinioClient from '@/lib/clients/keyv-minio';

const config = {
  BUCKET_NAME: 'europetrip',
  MINIO_OPTIONS: {
    endPoint: 'play.min.io',
    accessKey: 'Q3AM3UQ867SPQQA43P2F',
    // eslint-disable-next-line no-secrets/no-secrets
    secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    useSSL: true,
    port: 9000,
  },
  SESSIONS_SOURCE: 'minio',
};
const KeyvMinio = KeyvMinioClient(config as any);

describe('keyv-minio client unit tests', async () => {
  afterEach(async () => {
    return sinon.restore();
  });
  describe('saveToDb', () => {
    it('works', async () => {
      const key = 'key1';
      const value = { value: 'value1' };

      await KeyvMinio.set(key, JSON.stringify(value));

      const result = await KeyvMinio.get(key);

      expect(JSON.parse(result || '{}')).to.eql(value);
    });
  });

  describe('delete', () => {
    it('works', async () => {
      const key1 = 'key1';
      const value1 = { value: 'value1' };

      const key2 = 'key2';
      const value2 = { value: 'value2' };

      await KeyvMinio.set(key1, JSON.stringify(value1));
      await KeyvMinio.set(key2, JSON.stringify(value2));

      const result1 = await KeyvMinio.get(key1);
      const result2 = await KeyvMinio.get(key2);

      expect(JSON.parse(result1 || '{}')).to.eql(value1);
      expect(JSON.parse(result2 || '{}')).to.eql(value2);

      await KeyvMinio.delete(key1);
      const result3 = await KeyvMinio.get(key1);
      const result4 = await KeyvMinio.get(key2);

      expect(result3).to.eql(undefined);
      expect(JSON.parse(result4 || '{}')).to.eql(value2);
    });
  });
});
