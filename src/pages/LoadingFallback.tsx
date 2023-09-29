import TopNav from '../Components/TopNav';
import LoadingBanner from './LoadingBanner';

export default function LoadingFallback() {
  return (
    <>
      <TopNav />
      <LoadingBanner text="Loading.." />
    </>
  );
}
