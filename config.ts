import './envSetup';

import * as Common from '@voiceflow/common';

import { Config } from './types';

const { getProcessEnv, hasProcessEnv } = Common.utils.general;

const optionalProcessEnv = (name: string) => (hasProcessEnv(name) ? getProcessEnv(name) : null);

const CONFIG: Config = {
  // Configs
  NODE_ENV: getProcessEnv('NODE_ENV'),
  PORT: getProcessEnv('PORT'),

  AWS_ENDPOINT: optionalProcessEnv('AWS_ENDPOINT'),
  DYNAMO_ENDPOINT: optionalProcessEnv('DYNAMO_ENDPOINT'),
  CODE_HANDLER_ENDPOINT: getProcessEnv('CODE_HANDLER_ENDPOINT'),
  INTEGRATIONS_HANDLER_ENDPOINT: getProcessEnv('INTEGRATIONS_HANDLER_ENDPOINT'),
  API_HANDLER_ENDPOINT: getProcessEnv('API_HANDLER_ENDPOINT'),
  VF_DATA_ENDPOINT: getProcessEnv('VF_DATA_ENDPOINT'), // server-data-api endpoint

  PROJECT_SOURCE: optionalProcessEnv('PROJECT_SOURCE'),
  SESSIONS_SOURCE: optionalProcessEnv('SESSIONS_SOURCE'),
  SESSIONS_DYNAMO_TABLE: getProcessEnv('SESSIONS_DYNAMO_TABLE'), // diagrams table

  // Secrets
  DATADOG_API_KEY: getProcessEnv('DATADOG_API_KEY'),
  ADMIN_SERVER_DATA_API_TOKEN: getProcessEnv('ADMIN_SERVER_DATA_API_TOKEN'), // Server-data-api auth token

  AWS_ACCESS_KEY_ID: optionalProcessEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optionalProcessEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: optionalProcessEnv('AWS_REGION'),

  // Release information
  GIT_SHA: optionalProcessEnv('GIT_SHA'),
  BUILD_NUM: optionalProcessEnv('BUILD_NUM'),
  SEM_VER: optionalProcessEnv('SEM_VER'),
  BUILD_URL: optionalProcessEnv('BUILD_URL'),

  // Logging
  LOG_LEVEL: optionalProcessEnv('LOG_LEVEL'),
  MIDDLEWARE_VERBOSITY: optionalProcessEnv('MIDDLEWARE_VERBOSITY'),
};

export default CONFIG;