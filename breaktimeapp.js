import { BreakTime, setting, i18n } from "./breaktime.js";

export class BreakTimeApplication extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions,
            {
                title: i18n("BREAKTIME.app.title"),
                id: "breaktime-app",
                template: "modules/breaktime/templates/breaktime.html",
                width: 300,
                height: 'auto',
                resizable: false,
            });
    }

    getData() {
        let me = null;
        const players = game.users.contents.filter((el) => el.active).map((el) => {
            const player = {
                name: el.name,
                id: el.id,
                avatar: el.avatar,
                color: el.color,
                character: (el.isGM ? "GM" : el?.character?.name),
                self: el.isSelf,
                state: (setting('break')[el.id] || false),
            };
            if (el.id == game.user.id) me = player;
            return player;
        });
        return mergeObject(super.getData(), {
            players: players,
            my: me,
            gm: game.user.isGM,
            timestart: new Date(setting("start")).toLocaleTimeString('en-US', {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            }),
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.element.find("#breaktime-btn").click(this._changeReturnedState.bind(this));

        if (game.user.isGM) {
            this.element.find(".breaktime-avatar").click(this._changePlayerState.bind(this));
        }
    }

    _changeReturnedState() {
        BreakTime.emit("changeReturned");
    }

    _changePlayerState(event) {
        let playerId = event.currentTarget.closest('.breaktime-player').dataset.userId;
        BreakTime.emit("changeReturned", { userId: playerId });
    }

    async close(options = {}) {
        super.close(options);
        if (game.user.isGM)
            BreakTime.endBreak();
        else {
            if (options.ignore !== true) BreakTime.emit("changeReturned", { state: true });
        }
        BreakTime.app = null;
    }
}