import LoadingBanner from '../Components/Tailwind/LoadingBanner';
import TopNav from '../Components/TopNav';

export default function LoadingFallback() {
  return (
    <>
      <TopNav />
      <LoadingBanner text="Loading.." />
    </>
  );
}
