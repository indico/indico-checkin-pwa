import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';
import db from '../db/db';
import {authFetch} from '../utils/network';

const CheckInPage = () => {
  const [message, setMessage] = useState('Scanning...');
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const navigate = useNavigate();

  const onScanResult = async (decodedText, _decodedResult) => {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    // parse json object and detect if it is a valid ticket
    let eventData;
    try {
      eventData = JSON.parse(decodedText);
    } catch (e) {
      console.error('error parsing JSON', e);
      setProcessing(false);
      return;
    }
    console.log('event data: ', decodedText);

    const {checkin_secret, event_id, registrant_id, server_url, regform_id} = eventData;
    // Check if these variables are null
    if (
      checkin_secret == null ||
      event_id == null ||
      registrant_id == null ||
      server_url == null ||
      regform_id == null
    ) {
      // The QRCode data is not complete, so ignore
      console.log('QRCode Data is not valid. Please try again.');
      setProcessing(false);
      return;
    }

    // Check if the serverData is already in indexedDB
    const serverExists = await db.servers.get({base_url: server_url});
    if (!serverExists) {
      // Cannot check in if the server is not registered
      console.log('Server is not registered. Please try again.');
      setProcessing(false);
      return;
    }

    // Server is registered so we can check in the user
    try {
      const body = JSON.stringify({checked_in: true});
      // console.log('body: ', body);
      const response = await authFetch(
        server_url,
        `/api/checkin/event/${event_id}/registration/${regform_id}/${registrant_id}`,
        {
          method: 'PATCH',
          body: body,
        }
      );
      if (!response) {
        console.log('Error checking in user');
        setProcessing(false);
        return;
      }

      // Navigate to homepage
    } catch (err) {
      console.log('Error checking in the user: ', err);
      setProcessing(false);
      return;
    }

    // User is checked in
    console.log('User is checked in');
    setProcessing(false);
    navigate('/');
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <div className="justify-center items-center flex py-6">
        <Typography variant="h4" color="white">
          Check In
        </Typography>
      </div>

      <QrScannerPlugin
        fps={10}
        qrbox={250}
        aspectRatio={1}
        disableFlip={false}
        qrCodeSuccessCallback={onScanResult}
        onPermRefused={onPermRefused}
      />

      {/* <QrReader
                onResult={(result, error) => {
                    if (!!result) {
                        setData(result?.text);
                    }

                    if (!!error) {
                        console.info(error);
                    }
                }}
                sx={{ width: "100%" }}
                constraints={{ facingMode: "environment", aspectRatio: 1 }}
            /> */}

      <div className="justify-center items-center flex py-6 mx-6">
        <Typography variant="body1" className="text-center">
          {hasPermission
            ? message
            : 'Please give permission to access the camera and refresh the page'}
        </Typography>
      </div>
    </div>
  );
};

export default CheckInPage;
