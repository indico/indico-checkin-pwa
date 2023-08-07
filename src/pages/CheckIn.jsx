import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import QrScannerPlugin, {calcAspectRatio} from '../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';
import db from '../db/db';
import useSettings from '../hooks/useSettings';
import classes from './Events/Events.module.css';

const CheckInPage = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin} = useSettings();
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
    // console.log('event data: ', decodedText);

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

    // Check if the User exists in indexedDB
    // TODO: Users may register on server and not be updated on the app since we only update it when you enter the EventPage.
    // Could implement a system to update the data from time to time
    const userExists = await db.participants.get({id: registrant_id});
    if (!userExists) {
      // Cannot check in if the user is not registered
      console.log('User is not registered. Please try again.');
      setProcessing(false);
      return;
    }

    // Navigate to the ParticipantPage
    const navigateData = {
      autoCheckin: autoCheckin,
    };
    setProcessing(false);
    navigate(`/event/${event_id}/${regform_id}/${registrant_id}`, {
      state: navigateData,
    });
    // TODO: Make QR Code UI More responsive to what is happening
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <div className="justify-center items-center flex pt-3 pb-6">
        <Typography variant="h3 " className="font-semibold dark:text-white">
          Scan the Check-In QR Code
        </Typography>
      </div>

      <QrScannerPlugin
        fps={10}
        qrbox={250}
        aspectRatio={calcAspectRatio()}
        disableFlip={false}
        qrCodeSuccessCallback={onScanResult}
        onPermRefused={onPermRefused}
      />

      <div className="justify-center items-center flex py-6 mx-6">
        {hasPermission ? (
          <Typography
            variant="h3"
            className={`text-center font-bold animate-pulse duration-500 ${classes.scanningText}`}
          >
            QR CODE SCANNING
          </Typography>
        ) : (
          <Typography variant="body1" className="text-center">
            Please give permission to access the camera and refresh the page
          </Typography>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
