import { Box, Typography } from "@mui/material";
import { useState } from "react";
import QrScannerPlugin from "../Components/QrScannerPlugin";

const QrReaderPage = () => {
    const [data, setData] = useState("No Result");
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
        <Box>
            <Box
                sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    paddingTop: 3,
                    paddingBottom: 3,
                }}
            >
                <Typography variant="h4" color="white">
                    QrReader
                </Typography>
            </Box>

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

            <Box
                sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    paddingTop: 3,
                    paddingBottom: 3,
                    marginRight: 5,
                    marginLeft: 5,
                }}
            >
                <Typography
                    color="white"
                    variant="body1"
                    sx={{ textAlign: "center" }}
                >
                    {hasPermission
                        ? data
                        : "Please give permission to access the camera and refresh the page"}
                </Typography>
            </Box>
        </Box>
    );
};

export default QrReaderPage;
