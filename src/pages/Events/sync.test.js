import 'fake-indexeddb/auto';
import db from '../../db/db';
import {
  getEvent,
  getParticipant,
  getRegform,
  getRegforms,
  getParticipants,
} from '../../utils/client';
import {
  syncEvents,
  syncEvent,
  syncParticipant,
  syncRegform,
  syncRegforms,
  syncParticipants,
} from './sync';

jest.mock('../../utils/client', () => {
  return {
    getEvent: jest.fn(),
    getRegforms: jest.fn(),
    getRegform: jest.fn(),
    getParticipants: jest.fn(),
    getParticipant: jest.fn(),
  };
});

async function resetDB() {
  await db.delete();
  await db.open();
}

async function createDummyServer() {
  await db.servers.add({id: 1});
}

beforeEach(resetDB);
beforeEach(createDummyServer);

describe('test syncEvents()', () => {
  test('test a successful response', async () => {
    const errorModal = jest.fn();
    const events = [
      {id: 42, title: 'Mock event 1', startDt: '2020-01-01'},
      {id: 43, title: 'Mock event 2', startDt: '2020-01-02'},
    ];
    getEvent
      .mockResolvedValueOnce({ok: true, data: events[0]})
      .mockResolvedValueOnce({ok: true, data: events[1]});

    const storedEvents = [
      {id: 1, serverId: 1},
      {id: 2, serverId: 2},
    ];
    await db.events.bulkAdd(storedEvents);
    await syncEvents(storedEvents, null, errorModal);

    const updatedEvents = await db.events.toArray();
    expect(updatedEvents).toEqual([
      {id: 1, serverId: 1, indicoId: 42, title: 'Mock event 1', date: '2020-01-01'},
      {id: 2, serverId: 2, indicoId: 43, title: 'Mock event 2', date: '2020-01-02'},
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a 404 response', async () => {
    const errorModal = jest.fn();
    getEvent.mockResolvedValue({ok: false, status: 404});

    const storedEvent = {id: 1, serverId: 1};
    await db.events.add(storedEvent);
    await syncEvent(storedEvent, null, errorModal);

    const updatedEvents = await db.events.toArray();
    expect(updatedEvents.length).toBe(1);
    expect(updatedEvents[0]).toEqual({id: 1, serverId: 1, deleted: true});
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a failed response', async () => {
    const errorModal = jest.fn();
    getEvent.mockResolvedValue({ok: false});

    const storedEvent = {id: 1, serverId: 1};
    await db.events.add(storedEvent);
    await syncEvent(storedEvent, null, errorModal);

    const updatedEvents = await db.events.toArray();
    expect(updatedEvents.length).toBe(1);
    expect(updatedEvents[0]).toEqual(storedEvent);
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncRegform()', () => {
  test('test a successful response', async () => {
    const errorModal = jest.fn();
    const regform = {
      id: 42,
      title: 'Mock regform',
      isOpen: true,
      registrationCount: 12,
      checkedInCount: 6,
    };
    getRegform.mockResolvedValue({ok: true, data: regform});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await syncRegform(storedEvent, storedRegform, null, errorModal);

    const updatedRegforms = await db.regforms.toArray();
    expect(updatedRegforms.length).toBe(1);
    expect(updatedRegforms[0]).toEqual({
      id: 3,
      indicoId: 42,
      eventId: 1,
      title: 'Mock regform',
      isOpen: true,
      registrationCount: 12,
      checkedInCount: 6,
    });
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a 404 response', async () => {
    const errorModal = jest.fn();
    getRegform.mockResolvedValue({ok: false, status: 404});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await syncRegform(storedEvent, storedRegform, null, errorModal);

    const updatedRegforms = await db.regforms.toArray();
    expect(updatedRegforms.length).toBe(1);
    expect(updatedRegforms[0]).toEqual({
      id: 3,
      eventId: 1,
      deleted: true,
    });
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a failed response', async () => {
    const errorModal = jest.fn();
    getRegform.mockResolvedValue({ok: false});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await syncRegform(storedEvent, storedRegform, null, errorModal);

    const updatedRegforms = await db.regforms.toArray();
    expect(updatedRegforms.length).toBe(1);
    expect(updatedRegforms[0]).toEqual(storedRegform);
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncRegforms()', () => {
  test('test a successful response', async () => {
    const errorModal = jest.fn();
    const regforms = [
      {
        id: 10,
        title: 'Mock regform 10',
        isOpen: false,
        registrationCount: 2,
        checkedInCount: 1,
      },
      {
        id: 30,
        title: 'Mock regform 30',
        isOpen: true,
        registrationCount: 0,
        checkedInCount: 0,
      },
    ];
    getRegforms.mockResolvedValue({ok: true, data: regforms});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegforms = [
      {id: 1, indicoId: 10, eventId: 1},
      {id: 2, indicoId: 20, eventId: 1},
    ];
    await db.events.add(storedEvent);
    await db.regforms.bulkAdd(storedRegforms);
    await syncRegforms(storedEvent, null, errorModal);

    const updatedRegforms = await db.regforms.toArray();
    expect(updatedRegforms.length).toBe(2);
    expect(updatedRegforms).toEqual([
      {
        id: 1,
        indicoId: 10,
        eventId: 1,
        title: 'Mock regform 10',
        isOpen: false,
        registrationCount: 2,
        checkedInCount: 1,
      },
      {
        id: 2,
        indicoId: 20,
        eventId: 1,
        deleted: true,
      },
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a failed response', async () => {
    const errorModal = jest.fn();
    getRegforms.mockResolvedValue({ok: false});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegforms = [
      {id: 1, indicoId: 10, eventId: 1},
      {id: 2, indicoId: 20, eventId: 1},
    ];
    await db.events.add(storedEvent);
    await db.regforms.bulkAdd(storedRegforms);
    await syncRegforms(storedEvent, null, errorModal);

    const updatedRegforms = await db.regforms.toArray();
    expect(updatedRegforms.length).toBe(2);
    expect(updatedRegforms).toEqual(storedRegforms);
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncParticipant()', () => {
  test('test a successful response', async () => {
    const errorModal = jest.fn();
    const participant = {
      id: 42,
      fullName: 'John Doe',
      registrationDate: '2020-01-01',
      registrationData: [],
      state: 'complete',
      checkedIn: true,
      checkedInDt: '2020-01-02',
      occupiedSlots: 3,
    };
    getParticipant.mockResolvedValue({ok: true, data: participant});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    const storedParticipant = {id: 7, regformId: 3};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await db.participants.add(storedParticipant);
    await syncParticipant(storedEvent, storedRegform, storedParticipant, null, errorModal);

    const updatedParticipants = await db.participants.toArray();
    expect(updatedParticipants.length).toBe(1);
    expect(updatedParticipants[0]).toEqual({
      id: 7,
      indicoId: 42,
      regformId: 3,
      fullName: 'John Doe',
      registrationDate: '2020-01-01',
      registrationData: [],
      state: 'complete',
      checkedIn: true,
      checkedInDt: '2020-01-02',
      occupiedSlots: 3,
    });
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a 404 response', async () => {
    const errorModal = jest.fn();
    getParticipant.mockResolvedValue({ok: false, status: 404});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    const storedParticipant = {id: 7, regformId: 3};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await db.participants.add(storedParticipant);
    await syncParticipant(storedEvent, storedRegform, storedParticipant, null, errorModal);

    const updatedParticipants = await db.participants.toArray();
    expect(updatedParticipants.length).toBe(1);
    expect(updatedParticipants[0]).toEqual({
      id: 7,
      regformId: 3,
      deleted: true,
    });
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a failed response', async () => {
    const errorModal = jest.fn();
    getParticipant.mockResolvedValue({ok: false});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    const storedParticipant = {id: 7, regformId: 3};
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await db.participants.add(storedParticipant);
    await syncParticipant({id: 1, serverId: 1}, {id: 3}, {id: 7}, null, errorModal);

    const updatedParticipants = await db.participants.toArray();
    expect(updatedParticipants.length).toBe(1);
    expect(updatedParticipants[0]).toEqual(storedParticipant);
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncParticipants()', () => {
  test('test a successful response', async () => {
    const errorModal = jest.fn();
    const participants = [
      {
        id: 10,
        fullName: 'John Doe',
        registrationDate: '2020-01-01',
        registrationData: [],
        state: 'complete',
        checkedIn: true,
        checkedInDt: '2020-01-02',
        checkinSecret: '0000',
        occupiedSlots: 3,
      },
      {
        id: 30,
        fullName: 'Jane Doe',
        registrationDate: '2020-03-01',
        registrationData: [],
        state: 'unpaid',
        checkedIn: true,
        checkedInDt: null,
        checkinSecret: '1111',
        occupiedSlots: 1,
      },
    ];
    getParticipants.mockResolvedValue({ok: true, data: participants});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    const storedParticipants = [
      {id: 1, indicoId: 10, regformId: 3},
      {id: 2, indicoId: 20, regformId: 3},
    ];
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await db.participants.bulkAdd(storedParticipants);
    await syncParticipants(storedEvent, storedRegform, null, errorModal);

    const updatedParticipants = await db.participants.toArray();
    expect(updatedParticipants.length).toBe(3);
    expect(updatedParticipants).toEqual([
      {
        id: 1,
        indicoId: 10,
        regformId: 3,
        fullName: 'John Doe',
        registrationDate: '2020-01-01',
        registrationData: [],
        state: 'complete',
        checkedIn: true,
        checkedInDt: '2020-01-02',
        checkinSecret: '0000',
        occupiedSlots: 3,
      },
      {
        id: 2,
        indicoId: 20,
        regformId: 3,
        deleted: true,
      },
      {
        id: 3,
        indicoId: 30,
        regformId: 3,
        fullName: 'Jane Doe',
        registrationDate: '2020-03-01',
        registrationData: [],
        state: 'unpaid',
        checkedIn: true,
        checkedInDt: null,
        checkinSecret: '1111',
        occupiedSlots: 1,
        notes: '',
        deleted: false,
      },
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test a failed response', async () => {
    const errorModal = jest.fn();
    getParticipants.mockResolvedValue({ok: false});

    const storedEvent = {id: 1, serverId: 1};
    const storedRegform = {id: 3, eventId: 1};
    const storedParticipants = [
      {id: 7, regformId: 3},
      {id: 8, regformId: 3},
    ];
    await db.events.add(storedEvent);
    await db.regforms.add(storedRegform);
    await db.participants.bulkAdd(storedParticipants);
    await syncParticipants(storedEvent, storedRegform, null, errorModal);

    const updatedParticipants = await db.participants.toArray();
    expect(updatedParticipants.length).toBe(2);
    expect(updatedParticipants).toEqual(storedParticipants);
    expect(errorModal).toHaveBeenCalled();
  });
});
