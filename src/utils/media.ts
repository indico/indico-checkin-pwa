/**
 * Check if the camera permission is granted. If not, request it.
 * @returns true if permission was granted, false otherwise.
 */
export async function checkCameraPermissions(): Promise<boolean> {
  // navigator.permissions.query is not fully supported on firefox and safari
  if (!navigator?.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'environment'}, // Prefer the back camera
    });
    return true;
  } catch (e) {
    return false;
  }
}
