import Dexie, {Table} from 'dexie';

export interface ServerTable {
  id?: number;
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
  label: string;
  event_id: number;
  participants: number[]; // array of user ids
}

export const participantStates = {
  COMPLETE: 'complete',
  PENDING: 'pending',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  UNPAID: 'unpaid',
};
export interface ParticipantTable {
  id: number;
  full_name: string;
  regForm_id: number;
  registration_date: string;
  state: 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';
  checked_in: boolean;
  checked_in_dt: string;
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
      servers: 'id++, base_url, &indexName, client_id, scope, auth_token', // base_url is indexed
      events: 'id, title, date, server_base_url', // Primary key and indexed props
      regForms: 'id, label, event_id, participants',
      participants: 'id++, name, regForm_id, registration_date, state, checked_in, checked_in_dt',
    });
  }
}

const db = new MyDexie();

export default db;
