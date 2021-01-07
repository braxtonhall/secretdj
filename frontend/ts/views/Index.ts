import $ from "jquery";

import "../util/HandlebarsHelpers";
import Adapter from "../Adapter";
import {UserTransport} from "../../../src/Types";

import "../../scss/index.scss";
import DashboardTemplate from "../../templates/dash.hbs";
import SignupTemplate from "../../templates/signup.hbs";
import ErrorTemplate from "../../templates/error.hbs";
import TablesTemplate from "../../templates/tables.hbs";

const localStorageIdKey = 'sdj-id';

async function init() {
	const id = getID();
	if (id === '') {
		return renderSignup();
	} else {
		const response = await Adapter.getMyInfo(id);
		if (response.success && response.data) {
			localStorage.setItem(localStorageIdKey, id);
			await Adapter.confirmEmail(id);
			return renderDashboard(response.data);
		} else {
			return renderError();
		}
	}
}

async function renderDashboard(user: UserTransport) {
	const registrationResponse = await Adapter.getRegistrationStatus();
	const registrationOpen = registrationResponse.data.open;

	let recipient: UserTransport = {email: "", name: "", playlist: "", rule1: "", rule2: ""};
	if (!registrationOpen) {
		const recipientResponse = await Adapter.getRecipient(getID());
		recipient = recipientResponse.data;
	}

	const context = {
		registrationOpen,
		recipient,
		...user,
	};
	const renderedDashboard = DashboardTemplate(context);
	const $root = $('#root');
	$root.hide().html(renderedDashboard);
	if (registrationOpen) {
		$('#submit-edit').on('click', onClickEditUser);
	} else {
		$('#submit-playlist').on('click', onClickSubmitPlaylist);
	}
	$('#logout').on('click', onClickLogout);
	renderTable(registrationOpen);
	await fillTable();
	$root.fadeIn();
}

async function onClickEditUser(e: Event) {
	e.preventDefault();

	const $submitSpinner = $('#submit-edit-spinner');
	$submitSpinner.show();

	const name = ($('#name-input').val() as string).trim();
	const email = ($('#email-input').val() as string).trim();
	const rule1 = ($('#rule1-input').val() as string).trim();
	const rule2 = ($('#rule2-input').val() as string).trim();
	const playlist = '';

	const response = await Adapter.editUser(getID(), {name, email, rule1, rule2, playlist});

	if (response.success) {
		$('#submit-edit-error').hide();
		$('#submit-edit-success').show();
	} else {
		$('#submit-edit-success').hide();
		$('#submit-edit-error').show();
	}

	$submitSpinner.hide();
	return fillTable();
}

async function onClickSubmitPlaylist(e: Event) {
	e.preventDefault();
	const $submitSpinner = $('#submit-playlist-spinner');
	$submitSpinner.show();

	const playlist = $('#playlist-input').val() as string;

	const response = await Adapter.submitPlaylist(getID(), playlist);

	if (response.success) {
		$('#submit-playlist-error').hide();
		$('#submit-playlist-success').show();
		$('#submit-playlist').prop("disabled", true);
	} else {
		$('#submit-playlist-success').hide();
		$('#submit-playlist-error').show();
	}

	$submitSpinner.hide();
}

async function onClickLogout(e: Event) {
	e.preventDefault();
	localStorage.removeItem(localStorageIdKey);
	location.search = '';
}

async function renderError() {
	const context = {};
	const renderedError = ErrorTemplate(context);
	$('#root').hide().html(renderedError).fadeIn();
	$('#go-to-signup').on('click', () => window.location.href = window.location.origin);
}

async function renderSignup() {
	const registrationResponse = await Adapter.getRegistrationStatus();
	const registrationOpen = registrationResponse.data.open;

	const context = {registrationOpen};
	const renderedSignup = SignupTemplate(context);
	const $root = $('#root');
	$root.hide().html(renderedSignup);
	renderTable(registrationOpen);
	await fillTable();

	if (registrationOpen) {
		$('#submit-new-user').on('click', onClickSubmitNewUser);
	}

	$root.fadeIn();
}

function renderTable(registrationOpen: boolean) {
	const context = {registrationOpen};
	const renderedTables = TablesTemplate(context);
	$('#table-container').html(renderedTables);
}

async function fillTable() {
	const usersResponse = await Adapter.listParticipants();
	const users = usersResponse.data;

	if (users.length > 0) {
		const $tableBody = $('#participant-table-body');
		$tableBody.empty();

		for (const user of users) {
			const $row = $(`
				<tr class="recording-list-item">
					<td class="name"></td>
					<td class="rule1"></td>
					<td class="rule2"></td>
					${user.playlist ? getPlaylistHtml(user.playlist) : ""}
				</tr>`
			);

			$row.find('.name').text(user.name);
			$row.find('.rule1').text(user.rule1);
			$row.find('.rule2').text(user.rule2);
			$tableBody.append($row);
		}
	}
}

async function onClickSubmitNewUser(e: Event) {
	e.preventDefault();

	const $submitSpinner = $('#submit-spinner');
	const $emailInput = $('#email-input');

	$submitSpinner.show();

	const name = ($('#name-input').val() as string).trim();
	const email = ($emailInput.val() as string).trim();
	const rule1 = ($('#rule1-input').val() as string).trim();
	const rule2 = ($('#rule2-input').val() as string).trim();
	const playlist = '';

	const response = await Adapter.createUser({name, email, rule1, rule2, playlist});

	if (response.success) {
		$('#submit-error').hide();
		$('#submit-success').show();
		const $submitNewUser = $('#submit-new-user');
		$submitNewUser.prop("disabled", true);
		$emailInput.one('change', () => $submitNewUser.prop("disabled", false));
	} else {
		$('#submit-success').hide();
		$('#submit-error').show();
	}

	$submitSpinner.hide();
}

function getPlaylistHtml(playlist: string): string {
	if (playlist.includes("open.spotify.com")) {
		return `
			<td class="playlist-cell">
				<iframe
					src="${playlist.replace("open.spotify.com", "open.spotify.com/embed")}"
					width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
			</td>
		`;
	} else if (playlist.includes("youtube.com/playlist")) {
		return `
			<td class="playlist-cell">
				<iframe src="${playlist.replace("youtube.com/playlist", "youtube.com/embed/videoseries")}"
				width="250" height="80" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
			</td>
		`;
	} else {
		return `<td><a href="${playlist}">Link</a></td>`;
	}
}

function getID(): string {
	const params = new URLSearchParams(window.location.search);
	const paramId = params.get('id');
	if (paramId) {
		return paramId;
	}
	const localId = localStorage.getItem(localStorageIdKey);
	if (localId) {
		return localId;
	}
	return '';
}

$(init);
