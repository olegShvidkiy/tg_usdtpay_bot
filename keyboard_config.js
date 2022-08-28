module.exports = {
    BEFORE_START: {
        reply_markup: JSON.stringify({
            keyboard:[
                ["💵 Начать оплату", "📜 Инфо"],
                ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    },
    AFTER_START: {
        reply_markup: JSON.stringify({
            keyboard:[
                ["✅ Подтвердить платеж", "❌ Отменить оплату"],
                ["📜 Инфо"],
                ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    },
    SUCCESSFUL_PAYMENT: {
        reply_markup: JSON.stringify({
            keyboard:[
                ["✅ Проверить подписку"],
                ["📜 Помощь"],
            ],
            resize_keyboard: true
        }),
        parse_mode: "Markdown"
    }
}