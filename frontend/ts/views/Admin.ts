import $ from "jquery";

import "../util/HandlebarsHelpers";
import Adapter from "../Adapter";

import "../../scss/admin.scss";
import AdminTemplate from "../../templates/admin.hbs";

async function init() {
	const registrationResponse = await Adapter.getRegistrationStatus();
	const registrationOpen = registrationResponse.data.open;

	const context = {registrationOpen};
	const renderedAdminHtml = AdminTemplate(context);
	$('#root').hide().html(renderedAdminHtml).fadeIn();

	if (registrationOpen) {
		$('#submit-start').on('click', onClickStart);
	} else {
		$('#submit-reminder').on('click', onClickReminder);
	}
}

function onClickStart(e: Event) {
	e.preventDefault();
	return adminAction('#submit-start-spinner', 'startExchange');
}

function onClickReminder(e: Event) {
	e.preventDefault();
	return adminAction('#submit-reminder-spinner', 'sendReminders');
}

async function adminAction(spinnerId: string, adapterFunction: string) {
	const $submitSpinner = $(spinnerId);

	$submitSpinner.show();

	const id = $('#id-input').val() as string;
	const response = await Adapter[adapterFunction](id);

	if (response.success) {
		$('#admin-error').hide();
		$('#admin-success').show();
	} else {
		$('#admin-success').hide();
		$('#admin-error').show();
	}

	$submitSpinner.hide();
}

$(init);
