import { State } from '@/runtime';

import { AbstractManager } from '../utils';
import type { Session } from '.';

class SessionManager extends AbstractManager implements Session {
  private getSessionID(projectID: string, userID: string) {
    return `${projectID}.${userID}`;
  }

  async saveToDb(projectID: string, userID: string, state: State) {
    const { keyvRedis } = this.services;

    await keyvRedis!.set(this.getSessionID(projectID, userID), state);
  }

  async getFromDb(projectID: string, userID: string) {
    const { keyvRedis } = this.services;

    return keyvRedis!.get(this.getSessionID(projectID, userID));
  }

  async deleteFromDb(projectID: string, userID: string) {
    const { keyvRedis } = this.services;

    await keyvRedis!.delete(this.getSessionID(projectID, userID));
  }

  async updateVariables(projectID: string, userID: string, variables: Record<string, any>) {
    const state = await this.getFromDb(projectID, userID);

    const newState = {
      ...state,
      variables: { ...state.variables, ...variables },
    };

    await this.saveToDb(projectID, userID, newState);

    return newState;
  }
}

export default SessionManager;
