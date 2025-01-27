/**
 * Alexa captureV2 needs to be used in favor of general captureV2 because
 * it adds reprompts if exists
 * it handles captureV2 very differently
 */
import { BaseNode, BaseTrace } from '@voiceflow/base-types';
import { VoiceflowConstants, VoiceflowNode } from '@voiceflow/voiceflow-types';

import { Action, HandlerFactory } from '@/runtime';

import { addRepromptIfExists } from '../../utils';
import { mapSlots } from '../../utils.alexa';
import CommandHandler from '../command/command.alexa';
import { addNoReplyTimeoutIfExists } from '../noReply';
import RepeatHandler from '../repeat';
import { EntityFillingNoMatchAlexaHandler, entityFillingRequest, setElicit } from '../utils/entity';

const utilsObj = {
  addRepromptIfExists,
  addNoReplyTimeoutIfExists,
  commandHandler: CommandHandler(),
  repeatHandler: RepeatHandler(),
  entityFillingNoMatchHandler: EntityFillingNoMatchAlexaHandler(),
};

export const CaptureV2AlexaHandler: HandlerFactory<VoiceflowNode.CaptureV2.Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) =>
    node.platform === VoiceflowConstants.PlatformType.ALEXA && node.type === BaseNode.NodeType.CAPTURE_V2,
  handle: (node, runtime, variables) => {
    const request = runtime.getRequest();
    if (runtime.getAction() === Action.RUNNING) {
      utils.addRepromptIfExists(node, runtime, variables);
      utils.addNoReplyTimeoutIfExists(node, runtime);

      if (node.intent?.entities) {
        runtime.trace.addTrace<BaseTrace.GoToTrace>({
          type: BaseTrace.TraceType.GOTO,
          payload: { request: setElicit(entityFillingRequest(node.intent.name, node.intent.entities), true) },
        });
      }
      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }
    // check if there is a command in the stack that fulfills intent
    if (node.intentScope !== BaseNode.Utils.IntentScope.NODE && utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }
    if (utils.repeatHandler.canHandle(runtime)) {
      return utils.repeatHandler.handle(runtime, variables);
    }

    const { intent, entities } = request.payload;
    if (intent.name === node.intent?.name) {
      const firstEntity = node.intent?.entities && intent.slots?.[node.intent.entities[0]];
      if (node.variable && firstEntity) {
        variables.set(node.variable, firstEntity.value);
      } else {
        // when using prototype tool intent.slots is empty, so instead we rely on entities
        variables.merge(
          mapSlots({
            slots: intent.slots,
            entities,
            mappings: (node.intent?.entities ?? []).map((slot) => ({ slot, variable: slot })),
          })
        );
      }

      return node.nextId ?? null;
    }
    // handle noMatch
    const noMatchHandler = utils.entityFillingNoMatchHandler.handle(node, runtime, variables);

    return node.intent?.name
      ? noMatchHandler([node.intent?.name], entityFillingRequest(node.intent?.name, node.intent.entities))
      : noMatchHandler();
  },
});

export default () => CaptureV2AlexaHandler(utilsObj);
