
import "./App.css";
import { useState, useEffect } from "react";
import { PlayModule } from "./PlayModule";
import {
    useAppDispatch,
    useAppSelector,
    bootFile,
    bootRemoteGame,
    init,
} from "./Actions";

function Stats() {
    const [fps, setFps] = useState(0);

    useEffect(() => {
        if (!PlayModule) return;

        const timer = setInterval(() => {
            const frames = PlayModule.getFrames();
            PlayModule.clearStats();
            setFps(frames);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return <span className="stats">{fps} f/s</span>;
}

function App() {
    const state = useAppSelector((state) => state.play);
    const dispatch = useAppDispatch();
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        dispatch(init());
    }, [dispatch]);

    const handlePlay = async () => {
        setStarting(true);

        try {
            await dispatch(bootRemoteGame()).unwrap();
        } catch (error) {
            console.error("Falha ao iniciar God Hand:", error);
        } finally {
            setStarting(false);
        }
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (file) {
            dispatch(bootFile(file));
        }
    };

    return (
        <main className="god-hand-app">
            <h1>GOD HAND WEB</h1>
            <p>Emulador de God Hand para navegador</p>

            <button
                type="button"
                onClick={handlePlay}
                disabled={starting || state.value === "loading"}
            >
                {starting ? "INICIANDO..." : "JOGAR GOD HAND"}
            </button>

            <p>Status: {state.value}</p>

            <details>
                <summary>Carregar arquivo local</summary>
                <input
                    type="file"
                    accept=".iso,.bin,.chd,.elf"
                    onChange={handleChange}
                />
            </details>

            <Stats />

            <span className="version">
                {`Version: ${process.env.REACT_APP_VERSION}`}
            </span>
        </main>
    );
}

export default App;
