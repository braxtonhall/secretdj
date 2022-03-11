import axios from "axios";
import {SecretDJTransport} from "../../src/Types";

interface IAPIResponse<T = undefined> {
	success: boolean;
	data?: T;
}

const PREFIX = process.env.REQUEST_PREFIX;

export default {
	listParticipants: async (): Promise<IAPIResponse<SecretDJTransport>> => {
		try {
			const {status, data} = await axios.get(PREFIX + "/list", {headers: {"Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
};
