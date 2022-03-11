import $ from "jquery";

import "../util/HandlebarsHelpers";
import Adapter from "../Adapter";
import "../../scss/index.scss";
import DashTemplate from "../../templates/dash.hbs";
import TablesTemplate from "../../templates/tables.hbs";
import {UserTransport} from "../../../src/Types";

async function init() {
	const renderedSignup = DashTemplate();
	const $root = $('#root');
	$root.hide().html(renderedSignup);
	$('#table-container').html(TablesTemplate());
	await fillTable();

	$root.fadeIn();
}

async function fillTable() {
	const usersResponse = await Adapter.listParticipants();
	const users: UserTransport[] = Object.values(usersResponse.data).flatMap(x => x);
	// TODO make dynamic table pages lol
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
				<a href="${playlist}">Link</a>
			</td>
		`;
	} else {
		return `<td><a href="${playlist}">Link</a></td>`;
	}
}

$(init);
