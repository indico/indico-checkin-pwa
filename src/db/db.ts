import Dexie, {Table} from 'dexie';

export interface ServerTable {
  id: number;
  base_url: string;
  client_id: string;
  scope: string;
  auth_token: string;
}
export interface EventTable {
  id: number;
  title: string;
  date: string;
  server_base_url: string; // Reference to parent server
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
  fullName: string;
  regformId: number;
  eventId: number;
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
    this.version(2).stores({
      servers: 'id++, base_url, client_id',
      events: 'id, title, date, server_base_url',
      regForms: 'id, title, eventId',
      participants: 'id, name, regformId, eventId, state, checkedIn',
    });
  }
}

const db = new MyDexie();

export default db;
