import React, { useState } from "react";
import { Box, Grid, Checkbox, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import classes from "./Homepage.module.css";

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
        <Box sx={{ width: "100%", height: "100%" }}>
            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" color="white" sx={{ marginBottom: 3 }}>
                    Homepage
                </Typography>

                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        {list.map((item, idx) => {
                            return (
                                <Grid item xs={12} key={idx}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            width: "80%",
                                            height: 70,
                                            margin: 1,
                                            paddingLeft: 3,
                                            paddingRight: 3,
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                            backgroundColor: "#404040",
                                            borderRadius: 3,
                                        }}
                                    >
                                        <Checkbox
                                            style={{
                                                borderRadius: 20,
                                                height: 25,
                                                width: 25,
                                                color: "#34eb7a",
                                            }}
                                            checked={item.completed}
                                            onChange={() => toggleTodo(idx)}
                                        />

                                        <div
                                            onClick={navigateToQrReader}
                                            style={{
                                                display: "flex",
                                                flex: 1,
                                                height: "100%",
                                                alignItems: "center",
                                            }}
                                            className={
                                                classes.todoTextContainer
                                            }
                                        >
                                            <Typography
                                                sx={{
                                                    color: "#fff",
                                                    marginLeft: 4,
                                                }}
                                            >
                                                {item.text}
                                            </Typography>
                                        </div>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default Homepage;
