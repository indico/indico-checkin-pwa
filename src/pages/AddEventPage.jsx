import {useState} from 'react';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';

const AddEventPage = () => {
  const [data, setData] = useState('No Result');
  const [hasPermission, setHasPermission] = useState(true);

  const onScanResult = (decodedText, decodedResult) => {
    // handle scanned result
    console.log(decodedText, decodedResult);
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
            ? data
            : 'Please give permission to access the camera and refresh the page'}
        </Typography>
      </div>
    </div>
  );
};

export default AddEventPage;
