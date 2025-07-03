import 'fake-indexeddb/auto';
import db, {IDBBoolean, RegistrationState} from '../../db/db';
import {getParticipantByUuid} from '../../utils/client';
import {QRCodeEventData, QRCodeParticipantData} from '../Auth/utils';
import {handleEvent, handleParticipant} from './scan';

vi.mock('../../utils/client', () => {
  return {
    getParticipantByUuid: vi.fn(),
  };
});

async function resetDB() {
  await db.delete();
  await db.open();
}

const dummyServer = {
  id: 1,
  baseUrl: 'https://indico.example.com',
  clientId: '1234',
  scope: 'registrants',
  authToken: '0000',
};

const dummyEvent = {
  id: 1,
  serverId: 1,
  indicoId: 42,
  baseUrl: 'https://indico.example.com',
  title: 'Dummy event',
  date: '2020-01-01',
  deleted: 0 as IDBBoolean,
  registrationTags: [],
};

const dummyRegform = {
  id: 1,
  eventId: 1,
  indicoId: 73,
  title: 'Dummy regform',
  isOpen: true,
  registrationCount: 0,
  checkedInCount: 0,
  deleted: 0 as IDBBoolean,
};

const dummyParticipant = {
  id: 1,
  indicoId: 101,
  regformId: 1,
  fullName: 'Guinea Pig',
  registrationDate: '2020-01-01',
  state: 'complete' as RegistrationState,
  checkinSecret: '1234',
  checkedIn: false,
  checkedInLoading: 0 as IDBBoolean,
  occupiedSlots: 1,
  price: 10,
  currency: 'EUR',
  formattedPrice: '€10.00',
  isPaid: false,
  isPaidLoading: 0 as IDBBoolean,
  notes: '',
  deleted: 0 as IDBBoolean,
  tags: [],
};

async function createDummyServer() {
  await db.servers.add(dummyServer);
}

async function createDummyEvent() {
  await db.events.add(dummyEvent);
}

async function createDummyRegform() {
  await db.regforms.add(dummyRegform);
}

async function createDummyParticipant() {
  await db.participants.add(dummyParticipant);
}

beforeEach(resetDB);

describe('test handleParticipant()', () => {
  test('test missing server', async () => {
    const data: QRCodeParticipantData = {serverUrl: '', checkinSecret: ''};
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();
    expect(errorModal).toHaveBeenCalledWith({
      title: 'The server of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test existing participant with missing event', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyParticipant();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: dummyParticipant.checkinSecret,
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 9999, regformId: 9999, checkinSecret: '1234'},
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();
    expect(errorModal).toHaveBeenCalledWith({
      title: 'The event of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test existing participant with missing regform', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyParticipant();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: dummyParticipant.checkinSecret,
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 42, regformId: 9999, checkinSecret: '1234'},
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();
    expect(errorModal).toHaveBeenCalledWith({
      title: 'The registration form of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test existing participant', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyRegform();
    await createDummyParticipant();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: dummyParticipant.checkinSecret,
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 42, regformId: 73, checkinSecret: '1234'},
    });
    expect(errorModal).not.toHaveBeenCalled();
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();
    expect(errorModal).not.toHaveBeenCalled();
    expect(navigate.mock.calls).toHaveLength(1);
    expect(navigate).toHaveBeenCalledWith('/event/1/1/1', {
      replace: true,
      state: {autoCheckin: true, fromScan: true},
    });
  });

  test('test new participant returning 404', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyRegform();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: '1234',
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();

    expect(handleError).toHaveBeenCalledWith(
      {
        ok: false,
        status: 404,
      },
      'Could not fetch participant data'
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test new participant with missing event', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyRegform();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: '1234',
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 9999, regformId: 73, checkinSecret: '1234'},
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();

    expect(errorModal).toHaveBeenCalledWith({
      title: 'The event of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test new participant with missing regform', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyRegform();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: '1234',
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 42, regformId: 9999, checkinSecret: '1234'},
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();

    expect(errorModal).toHaveBeenCalledWith({
      title: 'The registration form of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  test('test new participant', async () => {
    await createDummyServer();
    await createDummyEvent();
    await createDummyRegform();
    const data = {
      serverUrl: dummyServer.baseUrl,
      checkinSecret: '1234',
    } as QRCodeParticipantData;
    const errorModal = vi.fn();
    const handleError = vi.fn();
    const navigate = vi.fn();

    (getParticipantByUuid as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      data: {id: 101, eventId: 42, regformId: 73, checkinSecret: '1234'},
    });
    await expect(
      handleParticipant(data, errorModal, handleError, navigate, true)
    ).resolves.not.toThrow();

    const participant = await db.participants.get(1);
    expect(participant).toEqual({
      id: 1,
      indicoId: 101,
      regformId: 1,
      checkinSecret: '1234',
      checkedInLoading: 0,
      notes: '',
      deleted: 0,
      isPaidLoading: 0,
    });

    expect(errorModal).not.toHaveBeenCalled();
    expect(navigate.mock.calls).toHaveLength(1);
    expect(navigate).toHaveBeenCalledWith('/event/1/1/1', {
      replace: true,
      state: {autoCheckin: true, fromScan: true},
    });
  });
});

describe('test handleEvent()', () => {
  test('test existing server', async () => {
    await createDummyServer();
    const data = {
      server: {baseUrl: dummyServer.baseUrl},
      eventId: 42,
      regformId: 73,
      title: 'Dummy event',
      date: '2020-01-01',
      regformTitle: 'Dummy regform',
    } as QRCodeEventData;
    const errorModal = vi.fn();
    const navigate = vi.fn();
    const qrCodePatterns = {};
    const setQRCodePatterns = vi.fn();

    await expect(
      handleEvent(data, errorModal, navigate, qrCodePatterns, setQRCodePatterns)
    ).resolves.not.toThrow();

    const event = await db.events.get(1);
    const regform = await db.regforms.get(1);

    expect(event).toEqual({
      id: 1,
      serverId: 1,
      indicoId: 42,
      baseUrl: 'https://indico.example.com',
      title: 'Dummy event',
      date: '2020-01-01',
      deleted: 0,
    });

    expect(regform).toEqual({
      id: 1,
      eventId: 1,
      indicoId: 73,
      title: 'Dummy regform',
      isOpen: false,
      registrationCount: 0,
      checkedInCount: 0,
      deleted: 0,
    });

    expect(errorModal).not.toHaveBeenCalled();
    expect(navigate.mock.calls).toHaveLength(1);
    expect(navigate).toHaveBeenCalledWith('/event/1', {replace: true});
  });
});
