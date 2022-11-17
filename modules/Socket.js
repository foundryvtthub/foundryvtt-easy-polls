import constants from "./constants.mjs";
import Poll from "./Poll.js";
import EasyPollError from "./utility/Error.js";

const capitalize = (s) => {
	if (typeof s !== "string") return undefined;
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export default class Socket {
	static socket = `module.${constants.moduleName}`;

	static needsGM() {
		let GMs = game.users.filter((u) => u.isGM && u.active);
		if (GMs.length === 0) {
			ui.notifications.error(game.i18n.localize("EasyPolls.Notifications.NoGM"), {});
			throw new EasyPollError(game.i18n.localize("EasyPolls.console.errors.noGM"));
		}
	}

	static sendAnswer(poll, answer, status = true) {
		this.needsGM();
		game.socket.emit(this.socket, {
			event: "sendAnswer",
			poll: poll,
			answer: answer,
			status: status,
			user: game.user.id,
		});
	}

	static listen() {
		game.socket.on(this.socket, (data) => {
			try {
				this["on" + capitalize(data.event)](data);
			} catch (e) {
				this.onundefined(data);
			}
		});
	}

	static onSendAnswer(data) {
		if (!game.user.isGM) return;
		Poll.answer(data.poll, data.answer, data.status, data.user);
	}

	static onundefined(data) {
		let msg = game.i18n.format("EasyPolls.console.errors.undefined-event", { event: data.event });
		ui.notifications.error(msg, {});
		console.log(msg);
		console.log(JSON.stringify(data));
		throw new EasyPollError(msg);
	}
}
