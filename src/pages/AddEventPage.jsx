import {useState} from 'react';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';

const AddEventPage = () => {
  const [data, setData] = useState('No Result');
  const [hasPermission, setHasPermission] = useState(true);

  const onScanResult = (decodedText, _decodedResult) => {
    // handle scanned result
    // parse json object and detect if it is a valid event
    let eventData;
    try {
      eventData = JSON.parse(decodedText);
    } catch (e) {
      console.error('error parsing JSON', e);
      return;
    }
    console.log('event data: ', eventData);

    const {
      event_id,
      title,
      date,
      server: {base_url, client_id, scope},
    } = eventData;

    // Perform OAuth2 Authorization Code Flow
    const client = new OAuth2Client({
      server: base_url,
      clientId: client_id,
      // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
    });

    setData(decodedText);
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <div className="justify-center items-center flex py-6">
        <Typography variant="h4" color="white">
          Scan the Event QR Code
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

      <div className="justify-center items-center flex py-6 mx-6">
        <Typography variant="body1" className="text-center">
          {hasPermission
            ? data
            : 'Please give permission to access the camera and refresh the page'}
        </Typography>
      </div>
    </div>
  );
};

export default AddEventPage;
