import { expect } from 'chai';
import sinon from 'sinon';

import LocalDataAPI from '@/runtime/lib/DataAPI/localDataAPI';

describe('localDataAPI client unit tests', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructor with projectsource', () => {
    const content = {
      version: 'version-val',
      project: 'project-val',
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );
    LocalDataApi.init();

    expect(jsonParseStub.args).to.eql([['readFileSync-val']]);
    expect(stubFS.readFileSync.args).to.eql([['join-val', 'utf8']]);
    expect(path.join.args).to.eql([['projects', 'projectSource-val']]);
  });

  it('constructor without projectsource', () => {
    const content = {
      version: 'version-val',
      project: 'project-val',
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    expect(() => {
      const api = new LocalDataAPI({ projectSource: '' }, { fs: stubFS as any, path: path as any });
    }).to.throw();
  });

  it('getVersion', async () => {
    const content = {
      version: { _id: '635fed30c361a59742273aeb' },
      project: 'project-val',
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );

    expect(await LocalDataApi.getVersion('635fed30c361a59742273aeb')).to.eql(content.version);
  });

  it('unhashVersionID', async () => {
    const content = {
      version: 'version-val',
      project: 'project-val',
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };
    const versionID = 'versionID';
    const creatorDataAPI = new LocalDataAPI(
      { projectSource: 'project-source' } as any,
      { fs: stubFS as any, path: path as any } as any
    );

    expect(await creatorDataAPI.unhashVersionID(versionID)).to.eql(versionID);
  });

  it('getProgram', async () => {
    const content = {
      version: 'version-val',
      project: 'project-val',
      programs: {
        a: 'b',
      },
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );

    expect(await LocalDataApi.getProgram('a')).to.eql('b');
  });

  it('getProject', async () => {
    const content = {
      version: 'version-val',
      project: { _id: '635fed30ac000c0006911e17' },
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );

    expect(await LocalDataApi.getProject('635fed30ac000c0006911e17')).to.eql(content.project);
  });

  it('fetchDisplayById', async () => {
    const content = {
      version: 'version-val',
      project: 'project-val',
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );

    expect(await LocalDataApi.fetchDisplayById()).to.eql(null);
  });

  it('getProjectNLP', async () => {
    const content = {
      version: 'version-val',
      project: {
        _id: '635fed30ac000c0006911e17',
        prototype: {
          nlp: {
            type: 'LUIS',
            appID: '684303ce-6e54-4965-ae13-ab50ede4f409',
            resourceID: 'alebdgdn:https://westus.api.cognitive.microsoft.com/',
          },
        },
        devVersion: '635fed30c361a59742273aeb',
        liveVersion: '6370b765c8ff0d00074de4bc',
        platformData: {
          invocationName: 'template project general',
        },
      },
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      { projectSource: 'projectSource-val' },
      { fs: stubFS as any, path: path as any }
    );

    expect(await LocalDataApi.getProjectNLP('635fed30ac000c0006911e17')).to.deep.include({
      nlp: {
        type: 'LUIS',
        appID: '684303ce-6e54-4965-ae13-ab50ede4f409',
        resourceID: 'alebdgdn:https://westus.api.cognitive.microsoft.com/',
      },
      devVersion: '635fed30c361a59742273aeb',
      liveVersion: '6370b765c8ff0d00074de4bc',
      platformData: {
        invocationName: 'template project general',
      },
    });
  });

  it('getProjectUsingAPIKey', async () => {
    const content = {
      version: 'version-val',
      project: { _id: '635fed30ac000c0006911e17' },
      programs: 'programs-val',
    };
    const stubFS = {
      readFileSync: sinon.stub().returns('readFileSync-val'),
    };
    const jsonParseStub = sinon.stub(JSON, 'parse').returns(content as any);
    const path = {
      join: sinon.stub().returns('join-val'),
    };

    const LocalDataApi = new LocalDataAPI(
      // eslint-disable-next-line no-secrets/no-secrets
      { projectSource: 'projectSource-val*KEY*635fed4e7a3ae00007cbddad' },
      { fs: stubFS as any, path: path as any }
    );

    expect(
      // eslint-disable-next-line no-secrets/no-secrets
      await LocalDataApi.getProjectUsingAPIKey('VF.DM.635fed4e7a3ae00007cbddad.27Cl22N4qxipRWm0')
    ).to.have.property('_id', '635fed30ac000c0006911e17');
  });
});
