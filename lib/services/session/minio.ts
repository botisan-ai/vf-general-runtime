import { State } from '@/runtime';

import { AbstractManager } from '../utils';
import type { Session } from '.';

class SessionManager extends AbstractManager implements Session {
  private getSessionID(projectID: string, userID: string) {
    return `${projectID}.${userID}`;
  }

  async saveToDb(projectID: string, userID: string, state: State) {
    const { KeyvMinio } = this.services;

    await KeyvMinio!.set(this.getSessionID(projectID, userID), JSON.stringify(state));
  }

  async getFromDb<T extends Record<string, any> = Record<string, any>>(projectID: string, userID: string) {
    const { KeyvMinio } = this.services;

    const data = await KeyvMinio!.get(this.getSessionID(projectID, userID));

    return (data ? JSON.parse(data) : undefined) as T;
  }

  async deleteFromDb(projectID: string, userID: string) {
    const { KeyvMinio } = this.services;

    await KeyvMinio!.delete(this.getSessionID(projectID, userID));
  }

  async updateVariables(projectID: string, userID: string, variables: Record<string, any>) {
    const state = await this.getFromDb<State>(projectID, userID);

    const newState = {
      ...state,
      variables: { ...state.variables, ...variables },
    };

    await this.saveToDb(projectID, userID, newState);

    return newState;
  }
}

export default SessionManager;
