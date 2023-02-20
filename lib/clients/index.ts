import { RateLimitClient } from '@voiceflow/backend-utils';

import { MongoSession } from '@/lib/services/session';
import { Config } from '@/types';

import { Source } from '../services/session/constants';
import Analytics, { AnalyticsSystem } from './analytics';
import DataAPI from './dataAPI';
import KeyvRedis from './keyv';
import KeyvMinioClient from './keyv-minio';
import Metrics, { MetricsType } from './metrics';
import MongoDB from './mongodb';
import { RedisClient } from './redis';
import Static, { StaticType } from './static';

export interface ClientMap extends StaticType {
  dataAPI: DataAPI;
  metrics: MetricsType;
  redis: ReturnType<typeof RedisClient>;
  rateLimitClient: ReturnType<typeof RateLimitClient>;
  mongo: MongoDB | null;
  keyvRedis: any;
  KeyvMinio: any;
  analyticsClient: AnalyticsSystem | null;
}

/**
 * Build all clients
 */
const buildClients = (config: Config): ClientMap => {
  const redis = RedisClient(config);
  const mongo = MongoSession.enabled(config) ? new MongoDB(config) : null;

  return {
    ...Static,
    redis,
    mongo,
    dataAPI: new DataAPI({ config, mongo }),
    metrics: Metrics(config),
    rateLimitClient: RateLimitClient('general-runtime', redis, config),
    keyvRedis: config.SESSIONS_SOURCE === Source.REDIS ? KeyvRedis(config) : null,
    KeyvMinio: config.SESSIONS_SOURCE === Source.MINIO && config.BUCKET_NAME ? KeyvMinioClient(config) : null,
    analyticsClient: Analytics(config),
  };
};

export const initClients = async (clients: ClientMap) => {
  await clients.mongo?.start();
};

export const stopClients = async (_config: Config, clients: ClientMap) => {
  await clients.mongo?.stop();
  await clients.metrics?.stop();
};

export default buildClients;
