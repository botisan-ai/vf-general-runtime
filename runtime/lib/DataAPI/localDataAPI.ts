import { AnyRecord, BaseModels } from '@voiceflow/base-types';
import * as FS from 'fs';
import glob from 'glob';
import * as Path from 'path';

import { DataAPI } from './types';
import { extractAPIKeyID } from './utils';

class LocalDataAPI<
  P extends BaseModels.Program.Model<any, any> = BaseModels.Program.Model<any, any>,
  V extends BaseModels.Version.Model<any> = BaseModels.Version.Model<any>,
  PJ extends BaseModels.Project.Model<any, any> = BaseModels.Project.Model<AnyRecord, AnyRecord>
> implements DataAPI<P, V, PJ>
{
  private versions: Array<V>;

  private projects: Array<PJ>;

  private programs: Record<string, P>;

  private apiKeyIDs: Record<string, string> = {};

  constructor({ projectSource }: { projectSource: string }, { fs, path }: { fs: typeof FS; path: typeof Path }) {
    if (!projectSource) throw new Error('project source undefined');
    const pattern = path.join(projectSource, '*.vf').replace(/\\/g, '/');
    const vfFiles = glob.sync(pattern);
    this.versions = [];
    this.projects = [];
    this.programs = {};

    vfFiles.forEach((vfFile) => {
      const content = JSON.parse(fs.readFileSync(vfFile, 'utf8'));

      if (!this.projects.find((project) => project._id === content.project._id)) {
        this.versions.push(content.version);
        this.projects.push(content.project);
        Object.assign(this.programs, content.programs);
      }
    });
  }

  public init = async () => {
    // no-op
  };

  public getVersion = async (versionID: string) => {
    return this.versions.find((version) => version._id === versionID) as V;
  };

  public unhashVersionID = async (versionID: string) => versionID;

  public getProgram = async (programID: string) => this.programs[programID];

  public getProject = async (projectID: string) => {
    return this.projects.find((project) => project._id === projectID) as PJ;
  };

  public fetchDisplayById = async () => null;

  public getProjectNLP = async (projectID: string) => {
    const data = this.projects.find((project) => project._id === projectID) as PJ;
    return {
      nlp: data.prototype?.nlp,
      devVersion: data.devVersion,
      liveVersion: data.liveVersion,
      platformData: data.platformData,
    };
  };

  public getProjectUsingAPIKey = async (key: string) => {
    const apiKeyID = extractAPIKeyID(key);
    return this.projects.find((project) => project._id === this.apiKeyIDs[apiKeyID]) as PJ;
  };
}

export default LocalDataAPI;
