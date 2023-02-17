import KeyvCompress from '@keyvhq/compress';
import Keyv from '@keyvhq/core';
import KeyvRedis from '@keyvhq/redis';
import { getOptionalProcessEnv } from '@voiceflow/backend-utils';
import { expect } from 'chai';
import sinon from 'sinon';

import SessionManager from '@/lib/services/session/redis';

const REDIS_CLUSTER_HOST = getOptionalProcessEnv('REDIS_CLUSTER_HOST');
const REDIS_CLUSTER_PORT = Number(getOptionalProcessEnv('REDIS_CLUSTER_PORT', '6379'));
const redisUrl = `redis://${REDIS_CLUSTER_HOST}:${REDIS_CLUSTER_PORT}`;

const keyvRedis = KeyvCompress(new Keyv({ store: new KeyvRedis(redisUrl), namespace: 'test' }));
const state = new SessionManager(
  { keyvRedis: KeyvCompress(new Keyv({ store: new KeyvRedis(redisUrl), namespace: 'test' })) } as any,
  {} as any
);

describe('local sessionManager unit tests', async () => {
  afterEach(async () => {
    await keyvRedis.clear();
    return sinon.restore();
  });
  describe('saveToDb', () => {
    it('works', async () => {
      const userID = 'user-id1';
      const projectID = 'project-id1';
      const stateObj = { foo: 'bar1' };

      await state.saveToDb(projectID, userID, stateObj as any);

      const result = await keyvRedis.get(`${projectID}.${userID}`);

      expect(result).to.eql(stateObj);
    });

    it('works 2', async () => {
      const set = sinon.stub().resolves(true);
      const state = new SessionManager({ keyvRedis: { set } } as any, {} as any);

      await state.saveToDb('project-id1', 'user-id1', { foo: 'bar1' } as any);

      expect(set.args).to.eql([[`project-id1.user-id1`, { foo: 'bar1' }]]);
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

      await keyvRedis.set(`${projectID}.${userID}`, stateObj);

      const result = await keyvRedis.get(`${projectID}.${userID}`);

      expect(result).to.eql(stateObj);
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

      await keyvRedis.set(`${projectID4}.${userID4}`, stateObj4);
      await keyvRedis.set(`${projectID5}.${userID5}`, stateObj5);
      expect(await state.getFromDb(projectID4, userID4)).to.eql(stateObj4);
      expect(await state.getFromDb(projectID5, userID5)).to.eql(stateObj5);

      await state.deleteFromDb(projectID4, userID4);

      const result4 = await keyvRedis.get(`${projectID4}.${userID4}`);
      const result5 = await keyvRedis.get(`${projectID5}.${userID5}`);

      expect(result4).to.eql(undefined);
      expect(result5).to.eql(stateObj5);
    });
  });
});
