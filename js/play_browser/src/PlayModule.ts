
import Play from "./Play";
import DiscImageDevice from "./DiscImageDevice";

export let PlayModule: any = null;

let initPromise: Promise<any> | null = null;

const module_overrides = {
    locateFile: function (path: string) {
        const baseURL =
            window.location.origin +
            window.location.pathname.substring(
                0,
                window.location.pathname.lastIndexOf("/")
            );

        return baseURL + "/" + path;
    },
    mainScriptUrlOrBlob: "",
};

export const initPlayModule = async function () {
    if (PlayModule) {
        return PlayModule;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        module_overrides.mainScriptUrlOrBlob =
            module_overrides.locateFile("Play.js");

        const module = await Play(module_overrides);

        module.FS.mkdir("/work");
        module.discImageDevice = new DiscImageDevice(module);
        module.ccall("initVm", "", [], []);

        PlayModule = module;
        return module;
    })();

    try {
        return await initPromise;
    } catch (error) {
        initPromise = null;
        throw error;
    }
};
