import axios from "axios";
import {UserTransport} from "../../src/Types";

interface IAPIResponse<T = undefined> {
	success: boolean;
	data?: T;
}

export default {
	// Admin
	startExchange: async (id: string): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post("/start", {}, {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	},
	sendReminders: async (id: string): Promise<IAPIResponse<{count: number}>> => {
		try {
			const {status, data} = await axios.post("/reminder", {}, {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	// General
	createUser: async (user: UserTransport): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post("/new", user, {headers: {"Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	},
	confirmEmail: async (id: string): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post("/confirm", {}, {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	},
	editUser: async (id: string, user: UserTransport): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post("/edit", user, {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	},
	submitPlaylist: async (id: string, playlist: string): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post("/playlist", {playlist}, {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	},
	getRecipient: async (id: string): Promise<IAPIResponse<UserTransport>> => {
		try {
			const {status, data} = await axios.get("/recipient", {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	getMyInfo: async (id: string): Promise<IAPIResponse<UserTransport>> => {
		try {
			const {status, data} = await axios.get("/user", {headers: {id, "Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	listParticipants: async (): Promise<IAPIResponse<UserTransport[]>> => {
		try {
			const {status, data} = await axios.get("/list", {headers: {"Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	getRegistrationStatus: async (): Promise<IAPIResponse<{open: boolean}>> => {
		try {
			const {status, data} = await axios.get("/registration", {headers: {"Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	}
};
