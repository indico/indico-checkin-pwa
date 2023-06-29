import { useLocation, useNavigate } from "react-router-dom";
import useSwipe from "../hooks/useSwipe";

const bottomTabs = ["/", "/qr-reader"];

const Background = () => {
    const navigation = useNavigate();
    const location = useLocation();

    const onSwipeRight = () => {
        const currRoute = location.pathname;
        const routeIdx = bottomTabs.indexOf(currRoute);
        if (routeIdx <= 0) return; // already at the first tab

        const prevRoute = bottomTabs[routeIdx - 1];
        navigation(prevRoute);
    };

    const onSwipeLeft = () => {
        const currRoute = location.pathname;
        const routeIdx = bottomTabs.indexOf(currRoute);
        if (routeIdx === -1 || routeIdx >= bottomTabs.length - 1) return; // already at the last tab

        const nextRoute = bottomTabs[routeIdx + 1];
        navigation(nextRoute);
    };

    const swipeHandlers = useSwipe({
        onSwipedLeft: onSwipeLeft,
        onSwipedRight: onSwipeRight,
    });

    return (
        <div
            {...swipeHandlers}
            className="absolute w-full h-full bg-gray-900 z-[-1]"
        />
    );
};

export default Background;
