export declare class TaskConfig {
    static tasks: string[];
    static registerTasks(gulp?: any): void;
    static _registerTasks(obj: any, gulp: any): void;
    copyFiles(): Promise<void[][]>;
    cleanDist(): Promise<void>;
    cleanTmp(): Promise<void>;
    default(): Promise<[any, void | [void, any, void]]>;
}
