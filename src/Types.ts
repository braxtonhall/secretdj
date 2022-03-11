export interface SecretDJTransport {
    [guild: string]: UserTransport[];
}

export interface UserTransport {
    name: string;
    rule1: string;
    rule2: string;
    playlist: string;
}

export interface User extends UserTransport {
    id: string;
    guild: string;
    recipient: string;
    done: boolean;
    feedId?: string;
}

export interface Pair {
    creator: User;
    recipient: User;
}
