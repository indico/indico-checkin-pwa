import {OptionsSwitch, SwitchOption} from '../../Components/OptionsSwitch';
import {SettingToggle} from '../../Components/SettingsToggle';
import TopNav from '../../Components/TopNav';
import useSettings from '../../hooks/useSettings';
import {scanDevices, scanDeviceIcons} from '../../utils/scan_device';

export default function CheckinPage() {
  const {
    autoCheckin,
    setAutoCheckin,
    rapidMode,
    setRapidMode,
    scanDevice,
    setScanDevice,
    requireRegistrationStateComplete,
    setRequireRegistrationStateComplete,
  } = useSettings();

  const toggleAutoCheckin = () => {
    localStorage.setItem('autoCheckin', (!autoCheckin).toString());
    setAutoCheckin(!autoCheckin);
  };

  const toggleRapidMode = () => {
    localStorage.setItem('rapidMode', (!rapidMode).toString());
    setRapidMode(!rapidMode);
  };

  const scanDeviceOptions: SwitchOption<string>[] = Object.keys(scanDevices).map(key => ({
    value: scanDevices[key as keyof typeof scanDevices],
    label: scanDevices[key as keyof typeof scanDevices],
    icon: scanDeviceIcons[key as keyof typeof scanDeviceIcons],
  }));

  const onScanDeviceChange = (v: string) => {
    localStorage.setItem('scanDevice', v);
    setScanDevice(v);
    if (v === scanDevices.camera) {
      setRapidMode(false);
    }
  };

  const toggleRequireRegistrationStateComplete = () => {
    localStorage.setItem(
      'requireRegistrationStateComplete',
      (!requireRegistrationStateComplete).toString()
    );
    setRequireRegistrationStateComplete(!requireRegistrationStateComplete);
  };

  return (
    <>
      <TopNav backBtnText="Check-in Settings" backNavigateTo="/settings" />
      <div className="flex flex-col gap-4 p-4">
        <SettingToggle
          title="Automatic check-in"
          description="Check in when a QR code is scanned"
          checked={autoCheckin}
          onToggle={toggleAutoCheckin}
        />
        <OptionsSwitch
          title="Scanning device"
          value={scanDevice}
          options={scanDeviceOptions}
          onChange={onScanDeviceChange}
        />
        {scanDevice !== scanDevices.externalKeyboard && (
          <SettingToggle
            title="Rapid mode"
            description="Automatically return to the scan page after each camera scan"
            checked={rapidMode}
            onToggle={toggleRapidMode}
          />
        )}
        <SettingToggle
          title="Require completed registrations"
          description="Only check-in participants with a completed (approved or paid) registration state"
          checked={requireRegistrationStateComplete}
          onToggle={toggleRequireRegistrationStateComplete}
        />
      </div>
    </>
  );
}
