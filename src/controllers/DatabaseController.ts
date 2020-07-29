import {User} from "../Types";
import {Collection, Db, MongoClient} from "mongodb";

export interface IDatabaseController {
	closeRegistration(): Promise<void>;
	isRegistrationOpen(): Promise<boolean>;

	getUser(id: string): Promise<User>;
	listUsers(): Promise<User[]>;
	createUser(user: User): Promise<User>;
	updateUser(user: User): Promise<User>;

	tick(): Promise<number>;

	forceInit(): Promise<void>;
}

export class DatabaseController implements IDatabaseController {
	private static instance: IDatabaseController;

	private static readonly USER_COLUMN = 'users';
	private static readonly REGISTRATION_COLUMN = 'registration';
	private static readonly TICKER_COLUMN = 'tickers';

	public static getInstance(): IDatabaseController {
		if (!this.instance) {
			if (process.env.MOCK === "true") {
				console.warn("Using Mock DB");
				this.instance = new MockDBC();
			} else {
				this.instance = new DatabaseController();
			}
		}
		return this.instance;
	}

	private db: Db = null;

	private constructor() {
		console.log("New Database Controller!");
	}

	public getUser(id: string): Promise<User> {
		return this.get<User>(DatabaseController.USER_COLUMN, {id});
	}

	public listUsers(): Promise<User[]> {
		return this.scan<User>(DatabaseController.USER_COLUMN);
	}

	public async createUser(user: User): Promise<User> {
		if (await this.get(DatabaseController.USER_COLUMN, {id: user.id})) {
			throw new Error('User with this ID already exists');
		}
		return this.write<User>(DatabaseController.USER_COLUMN, user);
	}

	public updateUser(user: User): Promise<User> {
		return this.update<User>(DatabaseController.USER_COLUMN, {id: user.id}, user);
	}

	public async closeRegistration(): Promise<void> {
		await this.update(DatabaseController.REGISTRATION_COLUMN, {id: "reg"},{id: "reg", open: false});
	}

	public async isRegistrationOpen(): Promise<boolean> {
		const registration = await this.get<any>(DatabaseController.REGISTRATION_COLUMN, {id: "reg"});
		if (registration) {
			return registration.open;
		} else {
			await this.write(DatabaseController.REGISTRATION_COLUMN, {id: "reg", open: true});
			return true;
		}
	}

	public async tick(): Promise<number> {
		const ticker = await this.atomicExchange<any>(
			DatabaseController.TICKER_COLUMN, {tickerId: "users"}, {$inc: {ticker: 1}});
		let res: number = 0;
		if (ticker !== null) {
			res = ticker.ticker;
		} else {
			await this.write(DatabaseController.TICKER_COLUMN, {tickerId: "users", ticker: 1});
		}
		return res;
	}

	public async forceInit(): Promise<void> {
		await this.open();
	}

	private async get<T>(column: string, query: any): Promise<T> {
		const col = await this.getCollection(column);

		const records: any[] = await (col as any).find(query).toArray();
		if (records === null || records.length === 0) {
			return null;
		} else {
			const record = records[0];
			delete record._id; // remove the record id, just so we can't use it
			return record;
		}
	}

	private async scan<T>(column: string): Promise<T[]> {
		try {
			const col = await this.getCollection(column);
			const records: any[] = await (col as any).find({}).toArray();
			if (records === null || records.length === 0) {
				return [];
			} else {
				for (const r of records) {
					delete r._id; // remove the record id, just so we can't use it
				}
				return records;
			}
		} catch (err) {
			console.error("DatabaseController::readRecords(..) - ERROR: " + err);
		}
		return [];
	}

	private async write<T>(column: string, item: T): Promise<T> {
		const collection = await this.getCollection(column);
		const copy = Object.assign({}, item);
		await collection.insertOne(copy);
		return copy;
	}

	private async update<T>(column: string, query: any, item: T): Promise<T> {
		const collection = await this.getCollection(column);
		const copy = Object.assign({}, item);
		await collection.replaceOne(query, copy);
		return copy;
	}

	private async atomicExchange<T>(column: string, query: any, update: any): Promise<T> {
		try {
			const col = await this.getCollection(column);

			const record: any = (await (col as any).findOneAndUpdate(query, update)).value;

			if (record === null || record === undefined) {
				return null;
			} else {
				delete record._id;
				return record;
			}
		} catch (err) {
			return null;
		}
	}

	private async open(): Promise<Db> {
		try {
			if (this.db === null) {
				const dbName = "secretdj";
				const dbHost = process.env.MONGO_URL; // make sure there are no extra spaces in config

				const client = await MongoClient.connect(dbHost);
				this.db = await client.db(dbName);

				console.info("DatabaseController::open() - db null; new connection made");
			}

			return this.db;
		} catch (err) {
			console.error("DatabaseController::open() - ERROR: " + err);
		}
	}

	private async getCollection(column: string): Promise<Collection> {
		try {
			const db = await this.open();
			return db.collection(column);
		} catch (err) {
			console.error("DatabaseController::getCollection( " + column +
				" ) - Mongo is probably not running; ERROR: " + err.message);
			process.exit(-1); // this is a fatal failure
		}
	}
}

class MockDBC implements IDatabaseController {
	private registrationOpen = true;
	private ticker = 0;
	private users = new Map<string, User>();

	public closeRegistration(): Promise<void> {
		this.registrationOpen = false;
		return Promise.resolve();
	}

	public forceInit(): Promise<void> {
		return Promise.resolve();
	}

	public getUser(id: string): Promise<User> {
		return Promise.resolve(this.users.get(id) ?? null);
	}

	public isRegistrationOpen(): Promise<boolean> {
		return Promise.resolve(this.registrationOpen);
	}

	public listUsers(): Promise<User[]> {
		return Promise.resolve(Array.from(this.users.values()));
	}

	public tick(): Promise<number> {
		return Promise.resolve(this.ticker++);
	}

	public createUser(user: User): Promise<User> {
		if (this.users.has(user.id)) {
			return Promise.reject(new Error('User with this ID already exits in mock DB'));
		} else {
			this.users.set(user.id, user);
			return Promise.resolve(user);
		}
	}

	public updateUser(user: User): Promise<User> {
		this.users.set(user.id, user);
		return Promise.resolve(user);
	}

}
