const BUTTONS = require("./buttons_enum");
module.exports = {
    BEFORE_START: {
        reply_markup: JSON.stringify({
            keyboard:[
                [BUTTONS.START_PAY, BUTTONS.INFO],
                [BUTTONS.READ_BEFORE]
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    },
    AFTER_START: {
        reply_markup: JSON.stringify({
            keyboard:[
                [BUTTONS.CONFIRM_PAY],
                [BUTTONS.INFO],
                [BUTTONS.READ_BEFORE]
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    },
    SUCCESSFUL_PAYMENT: {
        reply_markup: JSON.stringify({
            keyboard:[
                [BUTTONS.CHECK_PAY, BUTTONS.RENEW_SUB],
                [BUTTONS.HELP],
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    }
}