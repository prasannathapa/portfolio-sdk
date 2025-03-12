(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../node_modules/@directus/sdk/dist/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Client = void 0;
    const index_1 = require("../../node_modules/@directus/sdk/dist/index");
    class Client {
        sessionStartedCallbacks = [];
        sessionEndedCallbacks = [];
        user = null;
        authorId;
        backend;
        client;
        ready = false;
        constructor(backend, authorId) {
            this.authorId = authorId;
            this.backend = backend;
            this.client = (0, index_1.createDirectus)(backend).with((0, index_1.rest)()).with((0, index_1.authentication)('session', { credentials: 'include' }));
        }
        isReady() {
            return this.ready;
        }
        getUser() {
            return this.user;
        }
        init() {
            this.client.request((0, index_1.readMe)())
                .then((user) => {
                this.user = user;
                this.client.refresh();
            })
                .catch(() => {
                this.user = null;
                console.info("user is not logged in");
            })
                .finally(() => this.triggerSessionStarted());
        }
        logout() {
            this.client.logout()
                .then(() => this.user = null)
                .catch(error => console.error("Error during logout:", error))
                .finally(() => this.triggerSessionEnded());
        }
        login(redir) {
            window.location.href = `${this.backend}/auth/login/google?redirect=${redir}?author=${this.authorId}`;
        }
        /**
         * Register a callback for when a session starts.
         */
        onSessionStarted(callback) {
            this.sessionStartedCallbacks.push(callback);
        }
        /**
         * Register a callback for when a session ends.
         */
        onSessionEnded(callback) {
            this.sessionEndedCallbacks.push(callback);
        }
        /**
         * Remove a callback if it exists in either sessionStartedCallbacks or sessionEndedCallbacks.
         */
        removeCallback(callback) {
            // Remove from sessionStartedCallbacks if present.
            this.sessionStartedCallbacks = this.sessionStartedCallbacks.filter((cb) => cb !== callback);
            // Remove from sessionEndedCallbacks if present.
            // This assumes that the same callback reference could be registered for both events.
            this.sessionEndedCallbacks = this.sessionEndedCallbacks.filter((cb) => cb !== callback);
        }
        // These trigger methods would be called internally to notify observers.
        triggerSessionStarted() {
            this.ready = true;
            this.sessionStartedCallbacks.forEach((cb) => cb(this.user));
        }
        triggerSessionEnded() {
            this.sessionEndedCallbacks.forEach((cb) => cb());
        }
    }
    exports.Client = Client;
});
