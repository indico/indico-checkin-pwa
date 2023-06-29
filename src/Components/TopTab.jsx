import { Typography } from "./Tailwind";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";

const TopTab = () => {
    return (
        <div className="h-12 w-full px-4 bg-blue-400 dark:bg-gray-800 ">
            <div className="flex flex-row h-full w-full justify-between items-center">
                <Typography variant="h3">Indico Check-in</Typography>

                <Cog8ToothIcon
                    className="h-1/2 dark:text-white active:opacity-50 hover:cursor-pointer"
                    onClick={() => console.log("clicked")}
                />
            </div>
        </div>
    );
};

export default TopTab;
