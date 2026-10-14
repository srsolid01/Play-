
import { configureStore, createAsyncThunk, createReducer } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { PlayModule, initPlayModule } from "./PlayModule";

export type AudioState = {
    value: string;
};

const initialState: AudioState = {
    value: "unknown",
};

const GOD_HAND_URL =
    "https://pub-72fd1c2aa262458dba56c80dfee3f5c5.r2.dev/God%20Hand.iso";

const GOD_HAND_SIZE = 1567686656;

export const init = createAsyncThunk<void>("init", async () => {
    await initPlayModule();
});

export const bootRemoteGame = createAsyncThunk<void>(
    "bootRemoteGame",
    async () => {
        await initPlayModule();

        PlayModule.discImageDevice.setRemote(
            GOD_HAND_URL,
            GOD_HAND_SIZE
        );

        PlayModule.bootDiscImage("God Hand.iso");
    }
);

export const bootFile = createAsyncThunk<void, File>(
    "bootFile",
    async (file: File, thunkAPI) => {
        const fileName = file.name;
        const fileDotPos = fileName.lastIndexOf(".");

        if (fileDotPos === -1) {
            return thunkAPI.rejectWithValue("O arquivo precisa ter extensão.");
        }

        const fileExtension = fileName.substring(fileDotPos).toLowerCase();

        if (fileExtension === ".elf") {
            const data = new Uint8Array(await file.arrayBuffer());
            const stream = PlayModule.FS.open(fileName, "w+");

            try {
                PlayModule.FS.write(stream, data, 0, data.length, 0);
            } finally {
                PlayModule.FS.close(stream);
            }

            PlayModule.bootElf(fileName);
        } else {
            PlayModule.discImageDevice.setFile(file);
            PlayModule.bootDiscImage(fileName);
        }
    }
);

const reducer = createReducer(initialState, (builder) => {
    builder
        .addCase(init.fulfilled, (state) => {
            state.value = "initialized";
        })
        .addCase(bootRemoteGame.pending, (state) => {
            state.value = "loading";
        })
        .addCase(bootRemoteGame.fulfilled, (state) => {
            state.value = "loaded";
        })
        .addCase(bootRemoteGame.rejected, (state, action) => {
            state.value = `loading failed: ${action.error.message}`;
        })
        .addCase(bootFile.fulfilled, (state) => {
            state.value = "loaded";
        })
        .addCase(bootFile.rejected, (state, action) => {
            state.value = `loading failed: ${action.error.message}`;
        });
});

export const store = configureStore({
    reducer: { play: reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
