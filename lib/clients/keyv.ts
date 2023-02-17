import KeyvCompress from '@keyvhq/compress';
import Keyv from '@keyvhq/core';
import KeyvRedis from '@keyvhq/redis';

import { Config } from '@/types';

const KeyvRedisClient = ({ REDIS_CLUSTER_HOST, REDIS_CLUSTER_PORT }: Config): any =>
  REDIS_CLUSTER_HOST && REDIS_CLUSTER_PORT
    ? KeyvCompress(
        new Keyv({
          store: new KeyvRedis(`redis://${REDIS_CLUSTER_HOST}:${REDIS_CLUSTER_PORT}`),
          namespace: 'runtime-sessions',
        })
      )
    : null;

export default KeyvRedisClient;
