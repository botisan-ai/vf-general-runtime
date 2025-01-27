/**
 * Alexa stream needs to be used in favor of general stream because
 * it uses different command handler
 */
import { replaceVariables } from '@voiceflow/common';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

import { HandlerFactory } from '@/runtime';

import { CommandAlexaHandler } from '../../command/command.alexa';
import { StreamStateHandler } from '.';

const utilsObj = {
  commandHandler: CommandAlexaHandler(),
  replaceVariables,
};
export const StreamStateAlexaHandler: HandlerFactory<any, typeof utilsObj> = (utilsObj) => {
  const { handle, canHandle } = StreamStateHandler(utilsObj);
  return {
    handle,
    canHandle: (node, ...args) => node.platform === VoiceflowConstants.PlatformType.ALEXA && canHandle(node, ...args),
  };
};

export default () => StreamStateAlexaHandler(utilsObj);
