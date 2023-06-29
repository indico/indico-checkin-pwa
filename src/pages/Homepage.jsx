import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Checkbox } from "../Components/Tailwind/index.jsx";

class Todo {
    constructor(id, text, completed = false) {
        this.id = id;
        this.text = text;
        this.completed = completed;
    }

    toggle = () => {
        this.completed = !this.completed;
    };
}

const Homepage = () => {
    const [list, setList] = useState([
        new Todo(1, "TODO 1", false),
        new Todo(2, "TODO 2", false),
        new Todo(3, "TODO 3", false),
    ]);

    const navigate = useNavigate();

    const toggleTodo = (idx) => {
        list[idx].toggle();
        setList([...list]);
    };

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
                                <div className="w-full" key={idx}>
                                    <div className="flex flex-row w-4/5 items-center py-5 mb-5 pl-2 pr-2 mx-auto bg-slate-600 rounded-md">
                                        <Checkbox
                                            checked={item.completed}
                                            onChange={() => toggleTodo(idx)}
                                            className="rounded-full h-4 w-4 bg-gray-800"
                                        />

                                        <div
                                            onClick={navigateToQrReader}
                                            className="flex flex-1 active:opacity-50 h-full items-center"
                                        >
                                            <Typography
                                                variant="body1"
                                                className="ml-3"
                                            >
                                                {item.text}
                                            </Typography>
                                        </div>
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
