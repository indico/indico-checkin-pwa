// file = QrScannerPlugin.jsx
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { MutableRefObject, useEffect, useRef } from "react";
import { checkCameraPermissions } from "../utils/media";

// Id of the HTML element used by the Html5QrcodeScanner.
const qrcodeRegionId = "html5qr-code-full-region";

interface QrProps {
    fps?: number; // Expected frame rate of qr code scanning. example { fps: 2 } means the scanning would be done every 500 ms.
    qrbox?: number;
    aspectRatio?: number;
    disableFlip?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string, error: any) => void;
    verbose?: boolean;
    formatsToSupport?: Html5QrcodeSupportedFormats[];
    onPermRefused: () => void;
}

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: QrProps) => {
    // default config values
    let config: {
        fps: number;
        qrbox: number;
        aspectRatio: number;
        disableFlip: boolean;
        formatsToSupport?: Html5QrcodeSupportedFormats[];
    } = {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    if (props.formatsToSupport) {
        config.formatsToSupport = props.formatsToSupport;
    }
    return config;
};

const QrScannerPlugin = (props: QrProps) => {
    const html5CustomScanner: MutableRefObject<Html5Qrcode | null> =
        useRef(null);
    

    useEffect(() => {
        const showQRCode = async () => {
            const hasCamPerm: boolean = await checkCameraPermissions();
            if (!hasCamPerm) {
                // Notify that the permission is refused
                if (props.onPermRefused) {
                    props.onPermRefused();
                }
                return;
            };

            if (!html5CustomScanner.current?.getState()) {
                // when component mounts
                const config = createConfig(props);
                const verbose = props.verbose === true;
                // Suceess callback is required.
                if (!props.qrCodeSuccessCallback) {
                    throw new Error("qrCodeSuccessCallback is required."); // TODO: Check if we should throw an error
                }

                html5CustomScanner.current = new Html5Qrcode(qrcodeRegionId, {
                    ...config,
                    verbose,
                });
                html5CustomScanner.current.start(
                    { facingMode: "environment" },
                    config,
                    props.qrCodeSuccessCallback,
                    props.qrCodeErrorCallback
                );
            }
        };

        showQRCode();

        // cleanup function when component will unmount
        return () => {
            const stopQrScanner = async () => {
                if (html5CustomScanner.current?.isScanning) {
                    await html5CustomScanner.current.stop();
                    html5CustomScanner.current.clear();
                }
            };

            stopQrScanner();
        };
    }, [props]);

    return <div id={qrcodeRegionId} />;
};

export default QrScannerPlugin;
