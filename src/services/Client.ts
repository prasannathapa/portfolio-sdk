import { authentication, createDirectus, DirectusUser, readMe, rest } from "../../node_modules/@directus/sdk/dist/index";
export type SessionCallback = (user: DirectusUser | null) => void;

export class Client {
    private sessionStartedCallbacks: SessionCallback[] = [];
    private sessionEndedCallbacks: (() => void)[] = [];

    private user: (DirectusUser | null) = null;
    private authorId: string;
    private backend: string;
    private client;
    private ready = false;

    constructor(backend: string, authorId: string) {
        this.authorId = authorId;
        this.backend = backend;
        this.client = createDirectus(backend).with(rest()).with(authentication('session', { credentials: 'include' }));
    }

    public isReady() {
        return this.ready;
    }
    public getUser(): (DirectusUser | null) {
        return this.user;
    }

    public init(): void {
        this.client.request(readMe())
            .then((user) => {
                this.user = user as DirectusUser;
                this.client.refresh();
            })
            .catch(() => {
                this.user = null;
                console.info("user is not logged in");
            })
            .finally(() => this.triggerSessionStarted());
    }


    public logout(): void {
        this.client.logout()
            .then(() => this.user = null)
            .catch(error => console.error("Error during logout:", error))
            .finally(() => this.triggerSessionEnded());
    }

    public login(redir: string) {
        window.location.href = `${this.backend}/auth/login/google?redirect=${redir}?author=${this.authorId}`;
    }


    /**
     * Register a callback for when a session starts.
     */
    public onSessionStarted(callback: SessionCallback): void {
        this.sessionStartedCallbacks.push(callback);
    }

    /**
     * Register a callback for when a session ends.
     */
    public onSessionEnded(callback: () => void): void {
        this.sessionEndedCallbacks.push(callback);
    }

    /**
     * Remove a callback if it exists in either sessionStartedCallbacks or sessionEndedCallbacks.
     */
    public removeCallback(callback: SessionCallback): void {
        // Remove from sessionStartedCallbacks if present.
        this.sessionStartedCallbacks = this.sessionStartedCallbacks.filter((cb) => cb !== callback);
        // Remove from sessionEndedCallbacks if present.
        // This assumes that the same callback reference could be registered for both events.
        this.sessionEndedCallbacks = this.sessionEndedCallbacks.filter((cb) => cb !== callback);
    }
    // These trigger methods would be called internally to notify observers.
    protected triggerSessionStarted(): void {
        this.ready = true;
        this.sessionStartedCallbacks.forEach((cb) => cb(this.user));
    }

    protected triggerSessionEnded(): void {
        this.sessionEndedCallbacks.forEach((cb) => cb());
    }
}
