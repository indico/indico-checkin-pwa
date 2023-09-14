import TopTab from '../Components/TopTab';
import LoadingBanner from './LoadingBanner';

export default function LoadingFallback() {
  return (
    <>
      <TopTab />
      <LoadingBanner text="Loading.." />
    </>
  );
}
