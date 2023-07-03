import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../Components/Tailwind/index.jsx";
import { formatDateObj } from "../utils/date.ts";

class MockEvent {
    /**
     *
     * @param {number} id
     * @param {string} title
     * @param {Date} date
     * @param {List<string>} attendees
     */
    constructor(id, title, date = new Date(), attendees = []) {
        this.id = id;
        this.title = title;
        this.date = formatDateObj(date);
        this.attendees = attendees;
    }
}

const Homepage = () => {
    const [list, setList] = useState([
        new MockEvent(1, "MockEvent 1"),
        new MockEvent(2, "MockEvent 2"),
        new MockEvent(3, "MockEvent 3"),
    ]);

    const navigate = useNavigate();

    const navigateToEvent = (item) => {
        navigate(`/event/${item.id}`, { state: item });
    };

    return (
        <div className="w-full h-full">
            <div className="p-6">
                <Typography variant="h2" className="mb-6">
                    Events
                </Typography>

                <div className="flex flex-1">
                    <div className="grid grid-cols-1 w-full" spacing={2}>
                        {list.map((item, idx) => {
                            return (
                                <div
                                    className="w-full py-6 mb-3 px-4 mx-auto bg-blue-300 dark:bg-slate-600 rounded-xl active:opacity-50"
                                    key={idx}
                                    onClick={() => navigateToEvent(item)}
                                >
                                    <div className="flex flex-row w-full items-center">
                                        <Typography variant="body1">
                                            {item.title}
                                        </Typography>
                                    </div>

                                    <Typography
                                        variant="body2"
                                        className="text-gray-700 dark:text-gray-300"
                                    >
                                        {item.date}
                                    </Typography>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
