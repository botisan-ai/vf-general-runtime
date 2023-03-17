import { expect } from 'chai';
import sinon from 'sinon';

import KeyvMinioClient from '@/lib/clients/keyv-minio';
import SessionManager from '@/lib/services/session/minio';

const config = {
  // BUCKET_NAME: 'europetrip',
  BUCKET_NAME: 'vf-runtime-test',
  MINIO_OPTIONS: {
    endPoint: 'vf-runtime-test.s3.ap-northeast-1.amazonaws.com',
    // eslint-disable-next-line no-secrets/no-secrets
    accessKey: 'AKIAWGBI4NJGCW3C6NGS',
    // eslint-disable-next-line no-secrets/no-secrets
    secretKey: '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',
    useSSL: false,
    region: 'ap-northeast-1',
  },
  SESSIONS_SOURCE: 'minio',
};
const KeyvMinio = KeyvMinioClient(config as any);
const state = new SessionManager(
  {
    KeyvMinio,
  } as any,
  {} as any
);

describe('local sessionManager unit tests', async () => {
  afterEach(async () => {
    return sinon.restore();
  });
  describe('saveToDb', () => {
    it('works', async () => {
      const userID = 'user-id1';
      const projectID = 'project-id1';
      const stateObj = { foo: 'bar1' };

      await state.saveToDb(projectID, userID, stateObj as any);

      const result = await KeyvMinio.get(`${projectID}.${userID}`);

      expect(JSON.parse(result || '{}')).to.eql(stateObj);
    });
  });

  describe('getFromDb', () => {
    it('not found', async () => {
      const res = await state.getFromDb('project-id2', 'user-id2');
      expect(res).to.eql(undefined);
    });

    it('works', async () => {
      const projectID = 'project-id3';
      const userID = 'user-id3';
      const stateObj = { foo: 'bar3' };

      await KeyvMinio.set(`${projectID}.${userID}`, JSON.stringify(stateObj));

      const result = await KeyvMinio.get(`${projectID}.${userID}`);

      expect(JSON.parse(result || '{}')).to.eql(stateObj);
    });
  });

  describe('deleteFromDb', () => {
    it('works', async () => {
      const projectID4 = 'project-id4';
      const userID4 = 'user-id4';
      const stateObj4 = { foo: 'bar4' };

      const projectID5 = 'project-id5';
      const userID5 = 'user-id5';
      const stateObj5 = { foo: 'bar5' };

      await KeyvMinio.set(`${projectID4}.${userID4}`, JSON.stringify(stateObj4));
      await KeyvMinio.set(`${projectID5}.${userID5}`, JSON.stringify(stateObj5));
      expect(await state.getFromDb(projectID4, userID4)).to.eql(stateObj4);
      expect(await state.getFromDb(projectID5, userID5)).to.eql(stateObj5);

      await state.deleteFromDb(projectID4, userID4);

      const result4 = await KeyvMinio.get(`${projectID4}.${userID4}`);
      const result5 = await KeyvMinio.get(`${projectID5}.${userID5}`);

      expect(result4).to.eql(undefined);
      expect(JSON.parse(result5 || '{}')).to.eql(stateObj5);
    });
  });
});
