import {Pair, User} from "../Types";
import * as nodemailer from "nodemailer";

export interface IEmailController {
	sendAssignmentEmails(pairs: Pair[]): Promise<boolean>;
	sendConfirmationEmail(user: User): Promise<boolean>;
	sendPlaylistEmail(user: User): Promise<boolean>;
	sendReminderEmails(users: User[], message: string): Promise<boolean>;
}

export class EmailController implements IEmailController {
	private static instance: IEmailController;
	private static readonly SLEEP_TIME = 1000;

	private static transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		}
	});

	public static getInstance(): IEmailController {
		if (!this.instance) {
			this.instance = new EmailController();
		}
		return this.instance;
	}

	private constructor() {
		console.info("New Email Controller!");
	}

	private sleep(ms: number): Promise<void> {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	public async sendAssignmentEmails(pairs: Pair[]): Promise<boolean> {
		for (const pair of pairs) {
			await this.sendAssignmentEmail(pair);
			await this.sleep(EmailController.SLEEP_TIME);
		}
		return true;
	}

	private sendAssignmentEmail(pair: Pair): Promise<boolean> {
		const email = pair.creator.email;
		const subject = "SECRET DJ -begin- Here are your rules!";
		const html = EmailController.getAssignmentHTML(pair);
		return EmailController.send(email, subject, html);
	}

	public sendConfirmationEmail(user: User): Promise<boolean> {
		const email = user.email;
		const subject = "SECRET DJ -signup- Confirm your email address!";
		const html = EmailController.getConfirmationHTML(user);
		return EmailController.send(email, subject, html);
	}

	public sendPlaylistEmail(user: User): Promise<boolean> {
		const email = user.email;
		const subject = "SECRET DJ -ready- Here is your playlist!";
		const html = EmailController.getPlaylistHTML(user);
		return EmailController.send(email, subject, html, `${process.env.BCC}`);
	}

	public async sendReminderEmails(users: User[], message: string): Promise<boolean> {
		for (const user of users) {
			await this.sendReminderEmail(user, message);
			await this.sleep(EmailController.SLEEP_TIME);
		}
		return true;
	}

	private sendReminderEmail(user: User, message: string): Promise<boolean> {
		const email = user.email;
		const subject = "SECRET DJ -reminder- Don't forget the playlist!";
		const html = EmailController.getReminderHTML(user, message);
		return EmailController.send(email, subject, html);
	}

	private static async send(email: string, subject: string, html: string, bcc: string = ""): Promise<boolean> {
		console.log(`Emailing ${email}`);
		const mailOptions = {
			from: `"Secret DJ Housemaster 💿" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: subject,
			html: html,
			bcc,
		};
		if (process.env.DISABLE_EMAIL === "true") {
			console.log(`Email disabled. Skipping the send`);
			return true;
		}
		try {
			const result = await EmailController.transporter.sendMail(mailOptions);
			console.log("Success", email, result);
			return true;
		} catch (err) {
			console.error("Error", email, err);
			return false;
		}
	}

	private static getAssignmentHTML(pair: Pair): string {
		const dashboard = `${process.env.FRONTEND_URL}?id=${pair.creator.id}`;
		return `<p><span style="font-family: Courier New, courier;">SECRET DJ</span></p>
				<p><span style="font-family: Helvetica; font-size: 20px;">Hi, ${pair.creator.name}; It&#39;s time to start making your playlist for ${pair.recipient.name}. This playlist should be at least 8 songs long.</span></p>
				<p><span style="font-family: Helvetica;"><strong>Rule 1</strong>: ${pair.recipient.rule1}<br><strong>Rule 2</strong>: ${pair.recipient.rule2}</span></p>
				<p><span style="font-family: Helvetica;">When you are finished, make sure to submit the link </span><a href="${dashboard}"><span style="font-family: Helvetica;">here</span></a><span style="font-family: Helvetica;">.</span></p>
				<p><br></p>`;
	}

	private static getConfirmationHTML(user: User): string {
		const dashboard = `${process.env.FRONTEND_URL}?id=${user.id}`;
		return `<p><span style="font-family: Courier New, courier;">SECRET DJ</span></p>
				<p><span style="font-family: Helvetica; font-size: 20px;">Hi, ${user.name}; Welcome to Secret DJ.</span></p>
				<p><span style="font-family: Helvetica;">To complete your signup, visit your dashboard&nbsp;</span><a href="${dashboard}"><span style="font-family: Helvetica;">here</span></a><span style="font-family: Helvetica;">. From here you can edit your personal information and rules, and submit your playlist once the exchange has begun. When it starts you will get another email with your assignment.</span></p>
				<p><br></p>`;
	}

	private static getPlaylistHTML(user: User): string {
		const dashboard = `${process.env.FRONTEND_URL}?id=${user.id}`;
		return `<p><span style="font-family: Courier New, courier;">SECRET DJ</span></p>
		<p><span style="font-family: Helvetica; font-size: 20px;">Hi, ${user.name}; Your playlist is ready!</span></p>
		<p><span style="font-family: Helvetica;">To see all submitted playlists, visit your dashboard&nbsp;</span><a href="${dashboard}"><span style="font-family: Helvetica;">here</span></a><span style="font-family: Helvetica;">.</span></p>
		<p><br></p>`;
	}

	private static getReminderHTML(user: User, message: string): string {
		const dashboard = `${process.env.FRONTEND_URL}?id=${user.id}`;
		return `<p><span style="font-family: Courier New, courier;">SECRET DJ</span></p>
				<p><span style="font-family: Helvetica; font-size: 20px;">Hi, ${user.name}; Just a reminder.</span></p>
				<p><span style="font-family: Helvetica;">To see your recipient and their rules, and to submit their playlist, visit your dashboard&nbsp;</span><a href="${dashboard}"><span style="font-family: Helvetica;">here</span></a><span style="font-family: Helvetica;">.</span></p>
				${message ? `<p><span style="font-family: Courier New, courier;">MESSAGE FROM THE ADMIN: </span>${message}</p>` : ""}
				<p><br></p>`;
	}
}
