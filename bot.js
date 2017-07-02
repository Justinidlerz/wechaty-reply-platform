const { wrap: async } = require('co');
const { config, Contact, Wechaty, log, MediaMessage } = require('wechaty');
const path = require('path');
const QrcodeTerminal = require('qrcode-terminal');
const finis = require('finis');
const bot = Wechaty.instance({ profile: config.DEFAULT_PROFILE })
const match = require('./match');

bot
	.on('logout', user => log.info('Bot', `${user.name()} logouted`))
	.on('login', user => {
		log.info('Bot', `${user.name()} logined`)
		bot.say('Wechaty login')
	})
	.on('error', e => {
		log.info('Bot', 'error: %s', e)
		bot.say('Wechaty error: ' + e.message)
	})
	.on('scan', (url, code) => {
		if (!/201|200/.test(String(code))) {
			const loginUrl = url.replace(/\/qrcode\//, '/l/')
			QrcodeTerminal.generate(loginUrl)
		}
		console.log(`${url}\n[${code}] Scan QR Code in above url to login: `)
	})
	// .on('friend', async(function *(contact, request) {
	// 	let logMsg
	// 	const fileHelper = Contact.load('filehelper')

	// 	try {
	// 		logMsg = 'received `friend` event from ' + contact.get('name')
	// 		fileHelper.say(logMsg)
	// 		console.log(logMsg)

	// 		if (request) {
	// 		/**
	// 		 *
	// 		 * 1. New Friend Request
	// 		 *
	// 		 * when request is set, we can get verify message from `request.hello`,
	// 		 * and accept this request by `request.accept()`
	// 		 */
	// 		if (request.hello === 'ding') {
	// 			logMsg = 'accepted because verify messsage is "ding"'
	// 			yield request.accept();
	// 			yield request.send(contact, 'hello~');

	// 		} else {
	// 			logMsg = 'not auto accepted, because verify message is: ' + request.hello
	// 		}
	// 		} else {
	// 		/**
	// 		 *
	// 		 * 2. Friend Ship Confirmed
	// 		 *
	// 		 */
	// 		logMsg = 'friend ship confirmed with ' + contact.get('name')
	// 		}
	// 	} catch (e) {
	// 		logMsg = e.message
	// 	}

	// 	console.log(logMsg)
	// 	fileHelper.say(logMsg)

	// 	}))
	.on('message', async(function *(m) {
		try {
			const room = m.room()
			console.log((room ? '[' + room.topic() + ']' : '')
				+ '<' + m.from().name() + '>'
				+ ':' + m.toStringDigest()
			)
			const content = m.content();
			if (!m.self()) {
				const matchs = yield match.getMatch();
				const replys = matchs.filter(match => {
					if (match.types === 1) { // 包含
						if (~content.indexOf(match.content)) {
							return true;
						}
					} else { // 全等
						if (content === match.content) {
							return true;
						}
					}
					return false;
				});
				yield replys.map(reply => m.say(reply.reply));
			}
			// if (/^(ding|ping|bing|code)$/i.test(m.content()) && !m.self()) {
			// 	m.say('dong')
			// 	log.info('Bot', 'REPLY: dong')

			// 	const joinWechaty = `Join Wechaty Developers' Community\n\n` +
			// 		`Wechaty is used in many ChatBot projects by hundreds of developers.\n\n` +
			// 		`If you want to talk with other developers, just scan the following QR Code in WeChat with secret code: wechaty,\n\n` +
			// 		`you can join our Wechaty Developers' Home at once`
			// 	yield m.say(joinWechaty)
			// 	yield m.say(new MediaMessage(path.join(__dirname , './404.jpg')))
			// 	yield m.say('Scan now, because other Wechaty developers want to talk with you too!\n\n(secret code: wechaty)')
			// 	log.info('Bot', 'REPLY: Image')
			// }
		} catch (e) {
			log.error('Bot', 'on(message) exception: %s', e)
		}
	}))

bot.init()
	.catch(e => {
		log.error('Bot', 'init() fail: %s', e)
		bot.quit()
		process.exit(-1)
	})

finis((code, signal) => {
	const exitMsg = `Wechaty exit ${code} because of ${signal} `
	console.log(exitMsg)
	bot.say(exitMsg)
})