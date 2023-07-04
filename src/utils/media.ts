/**
 * Check if the camera permission is granted. If not, request it.
 * @returns true if permission was granted, false otherwise.
 */
export const checkCameraPermissions: () => Promise<boolean> = async () => {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    // The necessary APIs are supported
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log('Camera Permission Granted. stream: ', stream);
      return true;
    } catch (err) {
      console.log('User Denied permission to access the camera: ', err);
      return false;
    }
  } else {
    // APIs are not supported, handle the error
    return false;
  }
};

/**
 * Get the video stream from the camera.
 * @returns the video stream if it was successfully retrieved, null otherwise.
 */
export const getVideoStream: () => Promise<MediaStream | null> = async (
  facingMode: string = 'environment'
) => {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    // The necessary APIs are supported
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
        },
      });
      return stream;
    } catch (err) {
      return null;
    }
  } else {
    // APIs are not supported, handle the error
    return null;
  }
};
