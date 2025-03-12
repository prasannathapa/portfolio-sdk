import { DirectusUser } from "../../node_modules/@directus/sdk/dist/index";
export type SessionCallback = (user: DirectusUser | null) => void;
export declare class Client {
    private sessionStartedCallbacks;
    private sessionEndedCallbacks;
    private user;
    private authorId;
    private backend;
    private client;
    private ready;
    constructor(backend: string, authorId: string);
    isReady(): boolean;
    getUser(): (DirectusUser | null);
    init(): void;
    logout(): void;
    login(redir: string): void;
    /**
     * Register a callback for when a session starts.
     */
    onSessionStarted(callback: SessionCallback): void;
    /**
     * Register a callback for when a session ends.
     */
    onSessionEnded(callback: () => void): void;
    /**
     * Remove a callback if it exists in either sessionStartedCallbacks or sessionEndedCallbacks.
     */
    removeCallback(callback: SessionCallback): void;
    protected triggerSessionStarted(): void;
    protected triggerSessionEnded(): void;
}
