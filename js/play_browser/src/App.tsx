
import "./App.css";
import { useState, useEffect, ChangeEvent } from "react";
import { PlayModule } from "./PlayModule";
import {
    useAppDispatch,
    useAppSelector,
    bootFile,
    bootRemoteGame,
} from "./Actions";

function Stats() {
    const [fps, setFps] = useState(0);

    useEffect(() => {
        if (!PlayModule) return;

        const timer = window.setInterval(() => {
            const frames = PlayModule.getFrames();
            PlayModule.clearStats();
            setFps(frames);
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return <span className="stats">{fps} FPS</span>;
}

function App() {
    const state = useAppSelector((state) => state.play);
    const dispatch = useAppDispatch();
    const [starting, setStarting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handlePlay = async () => {
        setStarting(true);
        setErrorMessage("");

        try {
            await dispatch(bootRemoteGame()).unwrap();
        } catch (error) {
            console.error("Erro ao iniciar God Hand:", error);
            setErrorMessage(
                typeof error === "string"
                    ? error
                    : "Não foi possível iniciar o jogo. Verifique o console e a compilação."
            );
        } finally {
            setStarting(false);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setErrorMessage("");
            dispatch(bootFile(file));
        }
    };

    return (
        <main className="god-hand-app">
            <h1>GOD HAND WEB</h1>
            <p>Jogue God Hand diretamente no navegador.</p>

            <button
                type="button"
                onClick={handlePlay}
                disabled={starting || state.value === "loading"}
            >
                {starting ? "INICIANDO..." : "JOGAR GOD HAND"}
            </button>

            <p className="status">Status: {state.value}</p>

            {errorMessage && (
                <p className="error" role="alert">
                    {errorMessage}
                </p>
            )}

            <details>
                <summary>Carregar jogo do computador</summary>
                <input
                    type="file"
                    accept=".iso,.bin,.chd,.elf"
                    onChange={handleChange}
                />
            </details>

            <div className="emulator-stats">
                <Stats />
            </div>

            <span className="version">
                Version: {process.env.REACT_APP_VERSION}
            </span>
        </main>
    );
}

export default App;
