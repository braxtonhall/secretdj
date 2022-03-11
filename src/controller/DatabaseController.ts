import {User} from "../Types";
import {Collection, Db, MongoClient} from "mongodb";
import {DatabaseError} from "../Errors";
import {isUserTransport} from "../util/Util";

export interface IDatabaseController {
    closeRegistration(guild: string): Promise<void>;
    isRegistrationOpen(guild: string): Promise<boolean>;

    getUser(guild: string, id: string): Promise<User>;
    listUsers(guild?: string): Promise<User[]>;
    createUser(user: User): Promise<User>;
    updateUser(user: User, force?: boolean): Promise<User>;

    setDJFeed(guild: string, feed: string): Promise<void>;
    getDJFeed(guild: string): Promise<string>;

    getGuilds(userId?: string): Promise<string[]>;

    forceInit(): Promise<void>;
}

export class DatabaseController implements IDatabaseController {
    private static instance: IDatabaseController;

    private static readonly USER_COLUMN = 'users';
    private static readonly REGISTRATION_COLUMN = 'registration';
    private static readonly DJ_FEED_COLUMN = 'djfeed';

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

    public getUser(guild: string, id: string): Promise<User> {
        return this.get<User>(DatabaseController.USER_COLUMN, {guild, id});
    }

    public listUsers(guild?: string): Promise<User[]> {
        return this.scan<User>(DatabaseController.USER_COLUMN, guild ? {guild} : {});
    }

    private async ensureUserIsValidToWrite(user: User, force: boolean = false): Promise<void> {
        if (!isUserTransport(user)) {
            throw new DatabaseError('This does not look like a valid user');
        }
        if (!force && !(await this.isRegistrationOpen(user.guild))) {
            throw new DatabaseError('Registration is no longer open!');
        }
    }

    public async createUser(user: User): Promise<User> {
        await this.ensureUserIsValidToWrite(user);
        if (await this.get(DatabaseController.USER_COLUMN, {id: user.id})) {
            throw new DatabaseError('User with this ID already exists');
        }
        return this.write<User>(DatabaseController.USER_COLUMN, user);
    }

    public async updateUser(user: User, force: boolean = false): Promise<User> {
        await this.ensureUserIsValidToWrite(user, force);
        return this.update<User>(DatabaseController.USER_COLUMN, {id: user.id}, user);
    }

    public async closeRegistration(guild: string): Promise<void> {
        await this.update(DatabaseController.REGISTRATION_COLUMN, {id: guild},{id: guild, open: false});
    }

    public async isRegistrationOpen(guild: string): Promise<boolean> {
        const registration = await this.get<any>(DatabaseController.REGISTRATION_COLUMN, {id: guild});
        if (registration) {
            return registration.open;
        } else {
            await this.write(DatabaseController.REGISTRATION_COLUMN, {id: guild, open: true});
            return true;
        }
    }

    public async getDJFeed(guild: string): Promise<string> {
        const feed = await this.get<any>(DatabaseController.DJ_FEED_COLUMN, {id: guild});
        return feed.feed ?? "";
    }

    public async setDJFeed(guild: string, feed: string): Promise<void> {
        await this.update(DatabaseController.DJ_FEED_COLUMN, {id: guild}, {id: guild, feed});
    }

    public async getGuilds(userId?: string): Promise<string[]> {
        const users: User[] = await this.scan(DatabaseController.USER_COLUMN, userId ? {id: userId} : {});
        return [...new Set(users.map((user) => user.guild))];
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

    private async scan<T>(column: string, query: any = {}): Promise<T[]> {
        try {
            const col = await this.getCollection(column);
            const records: any[] = await (col as any).find(query).toArray();
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
        await collection.replaceOne(query, copy, {upsert: true});
        return copy;
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
    private users = new Map<string, User>();
    private djfeed = "";

    public closeRegistration(guild: string): Promise<void> {
        this.registrationOpen = false;
        return Promise.resolve();
    }

    public forceInit(): Promise<void> {
        return Promise.resolve();
    }

    public getUser(guild: string, id: string): Promise<User> {
        return Promise.resolve(this.users.get(id) ?? null);
    }

    public isRegistrationOpen(guild: string): Promise<boolean> {
        return Promise.resolve(this.registrationOpen);
    }

    public listUsers(guild: string): Promise<User[]> {
        return Promise.resolve(Array.from(this.users.values()));
    }

    public createUser(user: User): Promise<User> {
        if (this.users.has(user.id)) {
            return Promise.reject(new DatabaseError('User with this ID already exits in mock DB'));
        } else {
            this.users.set(user.id, user);
            return Promise.resolve(user);
        }
    }

    public updateUser(user: User): Promise<User> {
        this.users.set(user.id, user);
        return Promise.resolve(user);
    }

    public getGuilds(userId: string): Promise<string[]> {
        const guild = this.users.get(userId)?.guild;
        return Promise.resolve(guild ? [guild] : []);
    }

    public setDJFeed(guild: string, feed: string): Promise<void> {
        this.djfeed = feed;
        return Promise.resolve();
    }

    public getDJFeed(guild: string): Promise<string> {
        return Promise.resolve(this.djfeed);
    }

}
