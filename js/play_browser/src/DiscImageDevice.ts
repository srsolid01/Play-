
export default class DiscDevice {
    module: any;
    doneFlag: boolean;
    file: File | null;
    remoteUrl: string | null;
    remoteSize: number;
    error: string | null;

    constructor(module: any) {
        this.module = module;
        this.doneFlag = false;
        this.file = null;
        this.remoteUrl = null;
        this.remoteSize = 0;
        this.error = null;
    }

    read(dstPtr: number, offset: number, size: number) {
        if (!this.file && !this.remoteUrl) {
            throw new Error("No disc image set.");
        }

        this.doneFlag = false;
        this.error = null;

        const loadData = async () => {
            try {
                let data: Uint8Array;

                if (this.remoteUrl) {
                    const response = await fetch(this.remoteUrl, {
                        headers: {
                            Range: `bytes=${offset}-${offset + size - 1}`
                        }
                    });

                    if (response.status !== 206) {
                        throw new Error(
                            `Range request failed: HTTP ${response.status}`
                        );
                    }

                    data = new Uint8Array(await response.arrayBuffer());

                    if (data.length !== size) {
                        throw new Error(
                            `Incomplete disc read: ${data.length}/${size} bytes`
                        );
                    }
                } else {
                    const subsection = this.file!.slice(
                        offset,
                        offset + size
                    );
                    data = new Uint8Array(await subsection.arrayBuffer());
                }

                this.module.HEAPU8.set(data, dstPtr);
            } catch (error) {
                this.error = String(error);
                console.error("Disc read failed:", error);
            } finally {
                this.doneFlag = true;
            }
        };

        void loadData();
    }

    getFileSize() {
        if (this.remoteUrl) {
            return this.remoteSize;
        }

        if (!this.file) {
            throw new Error("No disc image set.");
        }

        return this.file.size;
    }

    isDone() {
        return this.doneFlag;
    }

    setFile(file: File) {
        this.file = file;
        this.remoteUrl = null;
        this.remoteSize = 0;
    }

    setRemote(url: string, size: number) {
        this.file = null;
        this.remoteUrl = url;
        this.remoteSize = size;
    }
}
