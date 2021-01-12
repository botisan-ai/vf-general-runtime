import { expect } from 'chai';
import sinon from 'sinon';

import StateManager, { utils as defaultUtils } from '@/lib/services/state';

const VERSION_ID = 'version_id';
const version = {
  prototype: {
    model: {
      slots: [{ name: 'slot1' }],
    },
    context: {
      variables: { variable1: 1, variable2: 2 },
    },
  },
  variables: ['variable1'],
  rootDiagramID: 'a',
};
const state = {
  stack: [
    {
      programID: version.rootDiagramID,
      storage: {},
      variables: {},
    },
  ],
  variables: { slot1: 0, variable1: 1, variable2: 2 },
  storage: {},
};

describe('state manager unit tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('generate', () => {
    it('works', async () => {
      const services = {
        dataAPI: {
          getVersion: sinon.stub(),
        },
      };

      const stateManager = new StateManager({ ...services, utils: { ...defaultUtils } } as any, {} as any);

      expect(await stateManager.generate(version as any)).to.eql(state);
      expect(services.dataAPI.getVersion.callCount).to.eql(0);
    });
  });

  describe('handle', () => {
    it('works', async () => {
      const services = {
        dataAPI: {
          getVersion: sinon.stub().resolves(version),
        },
      };

      const stateManager = new StateManager({ ...services, utils: { ...defaultUtils } } as any, {} as any);

      const context = {
        versionID: VERSION_ID,
        data: { foo: 'bar' },
      } as any;

      const newContext = await stateManager.handle(context);

      expect(newContext).to.eql({
        request: null,
        versionID: VERSION_ID,
        state,
        trace: [],
        data: {
          ...context.data,
          api: newContext.data.api,
        },
      });
      expect(await newContext.data.api.getVersion(VERSION_ID)).to.eql(version);
      expect(services.dataAPI.getVersion.args).to.eql([[VERSION_ID]]);
    });
  });
});
