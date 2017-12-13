exports.src = {
    sub: {
        mark: 'Начало',
        ttsPlay: { 
            voice: 'sasha',
            text: 'Для перехода в интерфейс марса скажите МАРС. Для показа лица скажите ЛИЦО. Либо кликните по кнопке смены интферфейса.',
            next: {
                goto: 'Прослушивание голоса',
            }
        }
    },

    sub2: {
        mark: 'Прослушивание голоса',
        on: { 'opt': { },
            '.*ли.*|.*цо.*|.*лицо.*': {
                mark: 'Лицо',
                ttsPlay: { 
                    voice: 'sasha',
                    text: 'Представляю вам интерфейс лица',
                    next: {
                        goto: 'Начало'
                    }
                },
                sendMESSAGE: { 
                    text: 'face'
                }
            },
            '.*м.*|.*ма.*|.*рс.*|.*марс.*': {
                mark: 'Марс',
                ttsPlay: { 
                    voice: 'sasha',
                    text: 'Представляю вам интерфейс Марс',
                    next: {
                        goto: 'Начало'
                    },
                },
                sendMESSAGE: { 
                    text: 'mars'
                }
            }
        },
        wait: {
            time: 10,
            next: {
                ttsPlay: { 
                    voice: 'sasha',
                    text: 'Я не получила никаких данных.',
                    next: {
                        goto: 'Начало'
                    }
                }
            }
        }
    },

    goto: 'Начало'
}