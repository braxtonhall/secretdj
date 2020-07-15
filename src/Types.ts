export interface UserTransport {
	email: string;
	name: string;
	rule1: string;
	rule2: string;
	playlist: string;
}

export interface User extends UserTransport {
	id: string;
	recipient: string;
	emailConfirmed: boolean;
	done: boolean;
}

export interface Pair {
	creator: User;
	recipient: User;
}
