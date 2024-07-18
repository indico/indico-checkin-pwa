const patterns = {
  error: [100, 50, 100],
  success: [250],
  clear: [0],
};

export function vibrate(pattern: number[]) {
  if (!navigator.vibrate || !navigator.userActivation.isActive) {
    console.warn('Haptics not supported!');
    return;
  }

  navigator.vibrate(pattern);
}

export const playVibration = {
  error: () => vibrate(patterns.error),
  success: () => vibrate(patterns.success),
  clear: () => vibrate(patterns.clear), // clear the vibration pattern (if needed)
};
