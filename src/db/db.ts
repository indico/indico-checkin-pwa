import Dexie, {Table} from 'dexie';

export interface ServerTable {
  id: number;
  baseUrl: string;
  clientId: string;
  scope: string;
  authToken: string;
}
export interface EventTable {
  id: number;
  serverId: number;
  title: string;
  date: string;
}
export interface RegFormTable {
  id: number;
  eventId: number;
  title: string;
  registrationCount: number;
  checkedInCount: number;
}

export interface ParticipantTable {
  id: number;
  regformId: number;
  eventId: number;
  fullName: string;
  registrationDate: string;
  registrationData: object[];
  state: 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';
  checkedIn: boolean;
  checkedInDt: string;
}

export interface ServerParticipantTable extends ParticipantTable {}

export class MyDexie extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  servers!: Table<ServerTable>;
  events!: Table<EventTable>;
  regForms!: Table<RegFormTable>;
  participants!: Table<ParticipantTable>;

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      servers: 'id++, baseUrl, clientId',
      events: 'id, serverId, title',
      regForms: 'id, eventId, title',
      participants: 'id, regformId, eventId, name, state, checkedIn',
    });
  }
}

const db = new MyDexie();

export default db;
