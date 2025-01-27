/**
 * Alexa capture needs to be used in favor of general capture because
 * it adds reprompts if exists
 * it handles capture very differently
 */
import { BaseTrace } from '@voiceflow/base-types';
import { VoiceflowConstants, VoiceflowNode } from '@voiceflow/voiceflow-types';
import wordsToNumbers from 'words-to-numbers';

import { Action, HandlerFactory } from '@/runtime';

import { SlotValue } from '../../types.alexa';
import { addRepromptIfExists } from '../../utils';
import CommandHandler from '../command/command.alexa';
import { addNoReplyTimeoutIfExists } from '../noReply';
import RepeatHandler from '../repeat';
import { entityFillingRequest, setElicit } from '../utils/entity';

interface Intent {
  slots: {
    [key: string]: SlotValue;
  };
}
const getSlotValue = (intent: Intent) => {
  const intentSlots = intent.slots || {};
  const value = Object.keys(intentSlots).length === 1 && Object.values(intentSlots)[0]?.value;
  if (!value) return null;

  const num = wordsToNumbers(value);
  if (typeof num !== 'number' || Number.isNaN(num)) {
    return value;
  }
  return num;
};

const utilsObj = {
  getSlotValue,
  addRepromptIfExists,
  addNoReplyTimeoutIfExists,
  commandHandler: CommandHandler(),
  repeatHandler: RepeatHandler(),
};

export const CaptureAlexaHandler: HandlerFactory<VoiceflowNode.Capture.Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => node.platform === VoiceflowConstants.PlatformType.ALEXA && !!node.variable,
  handle: (node, runtime, variables) => {
    const request = runtime.getRequest();

    if (runtime.getAction() === Action.RUNNING) {
      utils.addRepromptIfExists(node, runtime, variables);
      utils.addNoReplyTimeoutIfExists(node, runtime);

      if (node.intent && node.slots?.[0]) {
        runtime.trace.addTrace<BaseTrace.GoToTrace>({
          type: BaseTrace.TraceType.GOTO,
          payload: { request: setElicit(entityFillingRequest(node.intent, node.slots), true) },
        });
      }
      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    let nextId: string | null = null;

    // check if there is a command in the stack that fulfills intent
    if (utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }

    if (utils.repeatHandler.canHandle(runtime)) {
      return utils.repeatHandler.handle(runtime, variables);
    }

    const { intent } = request.payload;

    // try to match the first slot of the intent to the variable
    const value = utils.getSlotValue(intent);
    if (value !== null) {
      variables.set(node.variable, value);
    }

    ({ nextId = null } = node);

    return nextId;
  },
});

export default () => CaptureAlexaHandler(utilsObj);
