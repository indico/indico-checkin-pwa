import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../Components/Tailwind/index.jsx";

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
        this.date = date;
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

    const navigateToQrReader = () => {
        navigate("/qr-reader");
    };

    return (
        <div className="w-full h-full">
            <div className="p-6">
                <Typography variant="h1" className="mb-6">
                    Homepage
                </Typography>

                <div className="flex flex-1">
                    <div className="grid grid-cols-1 w-full" spacing={2}>
                        {list.map((item, idx) => {
                            return (
                                <div
                                    className="w-4/5 py-5 mb-5 pl-2 pr-2 mx-auto bg-slate-400 dark:bg-slate-600 rounded-md active:opacity-50"
                                    key={idx}
                                    onClick={navigateToQrReader}
                                >
                                    <div className="flex flex-row w-full items-center">
                                        <Typography
                                            variant="body1"
                                            className="ml-3"
                                        >
                                            {item.title}
                                        </Typography>
                                    </div>
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
