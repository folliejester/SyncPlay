(() => {
  const socket = io();
  let roomLocked = false;
  const EMOJI_GROUPS = [
    { name: 'Smileys', icon: '😊', items: '😀 😃 😄 😁 😆 😅 😂 🤣 🥲 🥹 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 🙂‍↕️ 😏 😒 🙂‍↔️ 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😮‍💨 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🫣 🤗 🫡 🤔 🫢 🤭 🤫 🤥 😶 😶‍🌫️ 😐 😑 😬 🫨 🫠 🙄 😯 😦 😧 😮 😲 🥱 😴 🫩 🤤 😪 😵 😵‍💫 🫥 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👋 🤚 🖐 ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 🫵 🫱 🫲 🫸 🫷 🫳 🫴 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🫶 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦿 🦶 👣 🫆 👂 🦻 👃 🫀 🫁 🧠 🦷 🦴 👀 👁 👅 👄 🫦 💋 🩸 👶 👧 🧒 👦 👩 🧑 👨 👩‍🦱 🧑‍🦱 👨‍🦱 👩‍🦰 🧑‍🦰 👨‍🦰 👱‍♀️ 👱 👱‍♂️ 👩‍🦳 🧑‍🦳 👨‍🦳 👩‍🦲 🧑‍🦲 👨‍🦲 🧔‍♀️ 🧔 🧔‍♂️ 👵 🧓 👴 👲 👳‍♀️ 👳 👳‍♂️ 🧕 👮‍♀️ 👮 👮‍♂️ 👷‍♀️ 👷 👷‍♂️ 💂‍♀️ 💂 💂‍♂️ 🕵️‍♀️ 🕵️ 🕵️‍♂️ 👩‍⚕️ 🧑‍⚕️ 👨‍⚕️ 👩‍🌾 🧑‍🌾 👨‍🌾 👩‍🍳 🧑‍🍳 👨‍🍳 👩‍🎓 🧑‍🎓 👨‍🎓 👩‍🎤 🧑‍🎤 👨‍🎤 👩‍🏫 🧑‍🏫 👨‍🏫 👩‍🏭 🧑‍🏭 👨‍🏭 👩‍💻 🧑‍💻 👨‍💻 👩‍💼 🧑‍💼 👨‍💼 👩‍🔧 🧑‍🔧 👨‍🔧 👩‍🔬 🧑‍🔬 👨‍🔬 👩‍🎨 🧑‍🎨 👨‍🎨 👩‍🚒 🧑‍🚒 👨‍🚒 👩‍✈️ 🧑‍✈️ 👨‍✈️ 👩‍🚀 🧑‍🚀 👨‍🚀 👩‍⚖️ 🧑‍⚖️ 👨‍⚖️ 👰‍♀️ 👰 👰‍♂️ 🤵‍♀️ 🤵 🤵‍♂️ 👸 🫅 🤴 🥷 🦸‍♀️ 🦸 🦸‍♂️ 🦹‍♀️ 🦹 🦹‍♂️ 🤶 🧑‍🎄 🎅 🧙‍♀️ 🧙 🧙‍♂️ 🧝‍♀️ 🧝 🧝‍♂️ 🧛‍♀️ 🧛 🧛‍♂️ 🧟‍♀️ 🧟 🧟‍♂️ 🧞‍♀️ 🧞 🧞‍♂️ 🧜‍♀️ 🧜 🧜‍♂️ 🧚‍♀️ 🧚 🧚‍♂️ 🧌 👼 🤰 🫄 🫃 🤱 👩‍🍼 🧑‍🍼 👨‍🍼 🙇‍♀️ 🙇 🙇‍♂️ 💁‍♀️ 💁 💁‍♂️ 🙅‍♀️ 🙅 🙅‍♂️ 🙆‍♀️ 🙆 🙆‍♂️ 🙋‍♀️ 🙋 🙋‍♂️ 🧏‍♀️ 🧏 🧏‍♂️ 🤦‍♀️ 🤦 🤦‍♂️ 🤷‍♀️ 🤷 🤷‍♂️ 🙎‍♀️ 🙎 🙎‍♂️ 🙍‍♀️ 🙍 🙍‍♂️ 💇‍♀️ 💇 💇‍♂️ 💆‍♀️ 💆 💆‍♂️ 🧖‍♀️ 🧖 🧖‍♂️ 💅 🤳 💃 🕺 👯‍♀️ 👯 👯‍♂️ 🕴 👩‍🦽 👩‍🦽‍➡️ 🧑‍🦽 🧑‍🦽‍➡️ 👨‍🦽 👨‍🦽‍➡️ 👩‍🦼 👩‍🦼‍➡️ 🧑‍🦼 🧑‍🦼‍➡️ 👨‍🦼 👨‍🦼‍➡️ 🚶‍♀️ 🚶‍♀️‍➡️ 🚶 🚶‍➡️ 🚶‍♂️ 🚶‍♂️‍➡️ 👩‍🦯 👩‍🦯‍➡️ 🧑‍🦯 🧑‍🦯‍➡️ 👨‍🦯 👨‍🦯‍➡️ 🧎‍♀️ 🧎‍♀️‍➡️ 🧎 🧎‍➡️ 🧎‍♂️ 🧎‍♂️‍➡️ 🏃‍♀️ 🏃‍♀️‍➡️ 🏃 🏃‍➡️ 🏃‍♂️ 🏃‍♂️‍➡️ 🧍‍♀️ 🧍 🧍‍♂️ 👭 🧑‍🤝‍🧑 👬 👫 👩‍❤️‍👩 💑 👨‍❤️‍👨 👩‍❤️‍👨 👩‍❤️‍💋‍👩 💏 👨‍❤️‍💋‍👨 👩‍❤️‍💋‍👨 👪 👨‍👩‍👦 👨‍👩‍👧 👨‍👩‍👧‍👦 👨‍👩‍👦‍👦 👨‍👩‍👧‍👧 👨‍👨‍👦 👨‍👨‍👧 👨‍👨‍👧‍👦 👨‍👨‍👦‍👦 👨‍👨‍👧‍👧 👩‍👩‍👦 👩‍👩‍👧 👩‍👩‍👧‍👦 👩‍👩‍👦‍👦 👩‍👩‍👧‍👧 👨‍👦 👨‍👦‍👦 👨‍👧 👨‍👧‍👦 👨‍👧‍👧 👩‍👦 👩‍👦‍👦 👩‍👧 👩‍👧‍👦 👩‍👧‍👧 🧑‍🧑‍🧒 🧑‍🧑‍🧒‍🧒 🧑‍🧒 🧑‍🧒‍🧒 🗣 👤 👥 🫂 🧳 🌂 ☂️ 🧵 🪡 🪢 🪭 🧶 👓 🕶 🥽 🥼 🦺 👔 👕 👖 🧣 🧤 🧥 🧦 👗 👘 🥻 🩴 🩱 🩲 🩳 👙 👚 👛 👜 👝 🎒 👞 👟 🥾 🥿 👠 👡 🩰 👢 👑 👒 🎩 🎓 🧢 ⛑ 🪖 💄 💍 💼'.split(' ') },
    { name: 'Animals', icon: '🐻', items: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐦‍⬛ 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷 🕸 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🪼 🪸 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🫏 🦍 🦧 🦣 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🫎 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪽 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🪿 🦩 🕊 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿 🦔 🐾 🐉 🐲 🐦‍🔥 🌵 🎄 🌲 🌳 🪾 🌴 🪹 🪺 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🍄‍🟫 🐚 🪨 🌾 💐 🌷 🪷 🌹 🥀 🌺 🌸 🪻 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐️ 🌟 ✨ ⚡️ ☄️ 💥 🔥 🌪 🌈 ☀️ 🌤 ⛅️ 🌥 ☁️ 🌦 🌧 ⛈ 🌩 🌨 ❄️ ☃️ ⛄️ 🌬 💨 💧 💦 🫧 ☔️ ☂️ 🌊'.split(' ') },
    { name: 'Food', icon: '🍔', items: '🍏 🍎 🍐 🍊 🍋 🍋‍🟩 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🫛 🥬 🫜 🥒 🌶 🫑 🌽 🥕 🫒 🧄 🧅 🫚 🥔 🍠 🫘 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 🫖 ☕️ 🍵 🧃 🥤 🧋 🫙 🍶 🍺 🍻 🥂 🍷 🫗 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽 🥣 🥡 🥢 🧂'.split(' ') },
    { name: 'Activities', icon: '⚽️', items: '⚽️ 🏀 🏈 ⚾️ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳️ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🪂 🏋️‍♀️ 🏋️ 🏋️‍♂️ 🤼‍♀️ 🤼 🤼‍♂️ 🤸‍♀️ 🤸 🤸‍♂️ ⛹️‍♀️ ⛹️ ⛹️‍♂️ 🤺 🤾‍♀️ 🤾 🤾‍♂️ 🏌️‍♀️ 🏌️ 🏌️‍♂️ 🏇 🧘‍♀️ 🧘 🧘‍♂️ 🏄‍♀️ 🏄 🏄‍♂️ 🏊‍♀️ 🏊 🏊‍♂️ 🤽‍♀️ 🤽 🤽‍♂️ 🚣‍♀️ 🚣 🚣‍♂️ 🧗‍♀️ 🧗 🧗‍♂️ 🚵‍♀️ 🚵 🚵‍♂️ 🚴‍♀️ 🚴 🚴‍♂️ 🏆 🥇 🥈 🥉 🏅 🎖 🏵 🎗 🎫 🎟 🎪 🤹 🤹‍♂️ 🤹‍♀️ 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🪇 🎷 🎺 🪗 🎸 🪕 🎻 🪈 🎲 ♟ 🎯 🎳 🎮 🎰 🧩'.split(' ') },
    { name: 'Travel', icon: '🌇', items: '🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍 🛺 🚨 🚔 🚍 🚘 🚖 🛞 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩 💺 🛰 🚀 🛸 🚁 🛶 ⛵️ 🚤 🛥 🛳 ⛴ 🚢 ⚓️ 🛟 🪝 ⛽️ 🚧 🚦 🚥 🚏 🗺 🗿 🗽 🗼 🏰 🏯 🏟 🎡 🎢 🛝 🎠 ⛲️ ⛱ 🏖 🏝 🏜 🌋 ⛰ 🏔 🗻 🏕 ⛺️ 🛖 🏠 🏡 🏘 🏚 🏗 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 ⛪️ 🕌 🕍 🛕 🕋 ⛩ 🛤 🛣 🗾 🎑 🏞 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙 🌃 🌌 🌉 🌁'.split(' ') },
    { name: 'Objects', icon: '🎉', items: '⌚️ 📱 📲 💻 ⌨️ 🖥 🖨 🖱 🖲 🕹 🗜 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽 🎞 📞 ☎️ 📟 📠 📺 📻 🎙 🎚 🎛 🧭 ⏱ ⏲ ⏰ 🕰 ⌛️ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯 🪔 🧯 🛢 🛍️ 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🪮 🪜 🧰 🪛 🔧 🔨 ⚒ 🛠 ⛏ 🪚 🔩 ⚙️ 🪤 🧱 ⛓ ⛓️‍💥 🧲 🔫 💣 🧨 🪓 🔪 🗡 ⚔️ 🛡 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🕳 🩹 🩺 🩻 🩼 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎 🔑 🗝 🚪 🪑 🛋 🛏 🛌 🧸 🪆 🖼 🪞 🪟 🛍 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🪩 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷 🪧 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒 🗓 📆 📅 🗑 🪪 📇 🗃 🗳 🗄 📋 📁 📂 🗂 🗞 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇 📐 📏 🧮 📌 📍 ✂️ 🖊 🖋 ✒️ 🖌 🖍 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓'.split(' ') },
    { name: 'Symbols', icon: '🔣', items: '❤️ 🩷 🧡 💛 💚 💙 🩵 💜 🖤 🩶 🤍 🤎 ❤️‍🔥 ❤️‍🩹 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🪯 🕉 ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈️ ♉️ ♊️ ♋️ ♌️ ♍️ ♎️ ♏️ ♐️ ♑️ ♒️ ♓️ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚️ 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕️ 🛑 ⛔️ 📛 🚫 💯 🫟 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗️ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯️ 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿️ 🅿️ 🛗 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧ 🚻 🚮 🎦 🛜 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸ ⏯ ⏹ ⏺ ⏭ ⏮ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 ♾ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫️ ⚪️ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾️ ◽️ ◼️ ◻️ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛️ ⬜️ 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 👁‍🗨 💬 💭 🗯 ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄️ 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚 🕛 🕜 🕝 🕞 🕟 🕠 🕡 🕢 🕣 🕤 🕥 🕦 🕧'.split(' ') },
    { name: 'Flags', icon: '🎌', items: '🏳️ 🏴 🏁 🚩 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇦🇫 🇦🇽 🇦🇱 🇩🇿 🇦🇸 🇦🇩 🇦🇴 🇦🇮 🇦🇶 🇦🇬 🇦🇷 🇦🇲 🇦🇼 🇦🇺 🇦🇹 🇦🇿 🇧🇸 🇧🇭 🇧🇩 🇧🇧 🇧🇾 🇧🇪 🇧🇿 🇧🇯 🇧🇲 🇧🇹 🇧🇴 🇧🇦 🇧🇼 🇧🇷 🇮🇴 🇻🇬 🇧🇳 🇧🇬 🇧🇫 🇧🇮 🇰🇭 🇨🇲 🇨🇦 🇮🇨 🇨🇻 🇧🇶 🇰🇾 🇨🇫 🇹🇩 🇨🇱 🇨🇳 🇨🇽 🇨🇨 🇨🇴 🇨🇵 🇰🇲 🇨🇬 🇨🇩 🇨🇰 🇨🇶 🇨🇷 🇨🇮 🇭🇷 🇨🇺 🇨🇼 🇨🇾 🇨🇿 🇩🇰 🇩🇯 🇩🇲 🇩🇴 🇪🇨 🇪🇬 🇸🇻 🇬🇶 🇪🇷 🇪🇪 🇪🇹 🇪🇺 🇫🇰 🇫🇴 🇫🇯 🇫🇮 🇫🇷 🇬🇫 🇵🇫 🇹🇫 🇬🇦 🇬🇲 🇬🇪 🇩🇪 🇬🇭 🇬🇮 🇬🇷 🇬🇱 🇬🇩 🇬🇵 🇬🇺 🇬🇹 🇬🇬 🇬🇳 🇬🇼 🇬🇾 🇭🇹 🇭🇳 🇭🇰 🇭🇺 🇮🇸 🇮🇳 🇮🇩 🇮🇷 🇮🇶 🇮🇪 🇮🇲 🇮🇱 🇮🇹 🇯🇲 🇯🇵 🎌 🇯🇪 🇯🇴 🇰🇿 🇰🇪 🇰🇮 🇽🇰 🇰🇼 🇰🇬 🇱🇦 🇱🇻 🇱🇧 🇱🇸 🇱🇷 🇱🇾 🇱🇮 🇱🇹 🇱🇺 🇲🇴 🇲🇰 🇲🇬 🇲🇼 🇲🇾 🇲🇻 🇲🇱 🇲🇹 🇲🇭 🇲🇶 🇲🇷 🇲🇺 🇾🇹 🇲🇽 🇫🇲 🇲🇩 🇲🇨 🇲🇳 🇲🇪 🇲🇸 🇲🇦 🇲🇿 🇲🇲 🇳🇦 🇳🇷 🇳🇵 🇳🇱 🇳🇨 🇳🇿 🇳🇮 🇳🇪 🇳🇬 🇳🇺 🇳🇫 🇰🇵 🇲🇵 🇳🇴 🇴🇲 🇵🇰 🇵🇼 🇵🇸 🇵🇦 🇵🇬 🇵🇾 🇵🇪 🇵🇭 🇵🇳 🇵🇱 🇵🇹 🇵🇷 🇶🇦 🇷🇪 🇷🇴 🇷🇺 🇷🇼 🇼🇸 🇸🇲 🇸🇦 🇸🇳 🇷🇸 🇸🇨 🇸🇱 🇸🇬 🇸🇽 🇸🇰 🇸🇮 🇬🇸 🇸🇧 🇸🇴 🇿🇦 🇰🇷 🇸🇸 🇪🇸 🇱🇰 🇧🇱 🇸🇭 🇰🇳 🇱🇨 🇵🇲 🇻🇨 🇸🇩 🇸🇷 🇸🇿 🇸🇪 🇨🇭 🇸🇾 🇹🇼 🇹🇯 🇹🇿 🇹🇭 🇹🇱 🇹🇬 🇹🇰 🇹🇴 🇹🇹 🇹🇳 🇹🇷 🇹🇲 🇹🇨 🇹🇻 🇻🇮 🇺🇬 🇺🇦 🇦🇪 🇬🇧 🏴 🏴 🏴 🇺🇳 🇺🇸 🇺🇾 🇺🇿 🇻🇺 🇻🇦 🇻🇪 🇻🇳 🇼🇫 🇪🇭 🇾🇪 🇿🇲 🇿🇼'.split(' ') }
  ];
  const REACTION_EMOJIS = ['👍', '😂', '❤️'];
  function enforceRoomCapacityGuard() {
    if (!window.fetch) return;
    fetch('/roomStatus')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.roomFull) return;
        roomLocked = true;
        try { socket.disconnect(); } catch (_) {}
        document.open();
        document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Room is full</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
       background:#050814;color:#e5e7eb;display:flex;align-items:center;
       justify-content:center;min-height:100vh;text-align:center;padding:16px;}
  .box{max-width:480px;background:#111827;border-radius:12px;
       border:1px solid #1f2937;padding:24px;box-shadow:0 10px 40px rgba(0,0,0,.6);}
  h1{margin:0 0 8px;font-size:1.4rem;}
  p{margin:0 0 4px;font-size:.95rem;color:#9ca3af;}
</style>
</head>
<body>
  <div class="box">
    <h1>Room is full</h1>
    <p>This watch room already has 2 people connected.</p>
    <p>Please try again later.</p>
  </div>
</body>
</html>`);
        document.close();
      })
      .catch(() => {});
  }
  enforceRoomCapacityGuard();
  try {
    const savedUsername = localStorage.getItem('ms_username');
    const savedAvatar = localStorage.getItem('ms_avatar');
    if (savedUsername && savedAvatar) {
      const jm = document.getElementById('joinModal');
      if (jm) jm.style.display = 'none';
    }
  } catch (_) {
  }
  const joinModal = document.getElementById('joinModal');
  const usernameInput = document.getElementById('usernameInput');
  const avatarGrid = document.getElementById('avatarGrid');
  const joinBtn = document.getElementById('joinBtn');
  const video = document.getElementById('video');
  const seekBar = document.getElementById('seekBar');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const timeInfo = document.getElementById('timeInfo');
  const volumeBar = document.getElementById('volumeBar');
  const subToggleBtn = document.getElementById('subToggleBtn');
  const subFontSize = document.getElementById('subFontSize');
  const subBack1000 = document.getElementById('subBack1000');
  const subBack200 = document.getElementById('subBack200');
  const subFwd200 = document.getElementById('subFwd200');
  const subFwd1000 = document.getElementById('subFwd1000');
  const subOffsetInput = document.getElementById('subOffsetInput');
  const subBroadcast = document.getElementById('subBroadcast');
  const syncNowBtn = document.getElementById('syncNowBtn');
  const fsBtn = document.getElementById('fsBtn');
  const notifyToggle = document.getElementById('notifyToggle');
  const miniControls = document.querySelector('.mini-controls');
  const messages = document.getElementById('messages');
  const typing = document.getElementById('typing');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const tabChatBtn = document.getElementById('tabChatBtn');
  const tabControlsBtn = document.getElementById('tabControlsBtn');
  const chatPanel = document.querySelector('.chat-panel');
  let me = { username: '', avatar: '' };
  let selectedAvatar = null;
  const avatarButtons = new Map();
  let joined = false;
  let editingProfile = false;
  let lastRemoteTs = 0;
  let subtitleTrack = null;
  let latencyMs = 80; 
  let lastPingSend = 0;
  let haveSubtitles = false;
  let subtitlesEnabled = true;           
  let fullscreenSubtitleKeeper = null;   
  let replyTo = null;                    
  let msgCounter = 0;
  function makeMessageId() {
    return `${Date.now()}_${++msgCounter}`;
  }
  let clearReplyPreviewFn = null;
  let scrollBottomBtn = null;
  let movieInfoData = null;
  let movieInfoModalEl = null;
  let posterFullscreenEl = null;
  let emojiGifPicker = null;
  let emojiTabBtn = null;
  let gifTabBtn = null;
  let emojiPanelEl = null;
  let gifPanelEl = null;
  let gifSearchInput = null;
  let gifResultsEl = null;
  let gifSearchTimeout = 0;
  function closePosterFullscreen() {
    if (posterFullscreenEl) {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      posterFullscreenEl.remove();
      posterFullscreenEl = null;
    }
  }
  function openPosterFullscreenFromSrc(src) {
    if (!src) return;
    closePosterFullscreen();
    const overlay = document.createElement('div');
    overlay.className = 'poster-fullscreen-backdrop';
    overlay.innerHTML = `<img src="${src}" alt="Poster">`;
    overlay.addEventListener('click', () => closePosterFullscreen());
    document.body.appendChild(overlay);
    posterFullscreenEl = overlay;
    if (overlay.requestFullscreen) {
      overlay.requestFullscreen().catch(() => {});
    }
  }
  function closeMovieInfoModal() {
    if (movieInfoModalEl) movieInfoModalEl.style.display = 'none';
  }
  function openMovieInfoModal() {
    if (!movieInfoData) return;
    if (!movieInfoModalEl) {
      movieInfoModalEl = document.createElement('div');
      movieInfoModalEl.className = 'movie-info-modal-backdrop';
      movieInfoModalEl.innerHTML = `
        <div class="movie-info-modal" role="dialog" aria-modal="true">
          <button type="button" class="movie-info-close" aria-label="Close">&times;</button>
          <div class="movie-info-header">
            <img class="movie-info-poster" alt="Poster" style="display:none;">
            <div>
              <div class="movie-info-title"></div>
              <div class="movie-info-meta"></div>
            </div>
          </div>
          <div class="movie-info-plot"></div>
        </div>
      `;
      document.body.appendChild(movieInfoModalEl);
      const modal = movieInfoModalEl.querySelector('.movie-info-modal');
      const closeBtn = movieInfoModalEl.querySelector('.movie-info-close');
      closeBtn.addEventListener('click', closeMovieInfoModal);
      movieInfoModalEl.addEventListener('click', (e) => {
        if (e.target === movieInfoModalEl) closeMovieInfoModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closePosterFullscreen();
          closeMovieInfoModal();
        }
      });
    }
    const titleEl = movieInfoModalEl.querySelector('.movie-info-title');
    const metaEl = movieInfoModalEl.querySelector('.movie-info-meta');
    const plotEl = movieInfoModalEl.querySelector('.movie-info-plot');
    const posterEl = movieInfoModalEl.querySelector('.movie-info-poster');
    const title = movieInfoData.title || movieInfoData.Title || '';
    const year = movieInfoData.year || movieInfoData.Year || '';
    const runtime = movieInfoData.runtime || movieInfoData.Runtime || '';
    const rated = movieInfoData.rated || movieInfoData.Rated || '';
    const genre = movieInfoData.genre || movieInfoData.Genre || '';
    const director = movieInfoData.director || movieInfoData.Director || '';
    const actors = movieInfoData.actors || movieInfoData.Actors || '';
    const plot = movieInfoData.plot || movieInfoData.Plot || '';
    titleEl.textContent = year ? `${title} (${year})` : title;
    const lines = [];
    const line1 = [];
    if (rated && rated !== 'N/A') line1.push(rated);
    if (runtime && runtime !== 'N/A') line1.push(runtime);
    if (line1.length) lines.push(line1.join(' • '));
    if (genre && genre !== 'N/A') lines.push(genre);
    if (director && director !== 'N/A') lines.push(`Dir: ${director}`);
    if (actors && actors !== 'N/A') lines.push(`Cast: ${actors}`);
    metaEl.textContent = lines.join('\n');
    plotEl.textContent = plot && plot !== 'N/A' ? plot : '';
    const poster = movieInfoData.poster || movieInfoData.Poster;
    if (poster && poster !== 'N/A') {
      posterEl.src = poster;
      posterEl.style.display = '';
      posterEl.style.cursor = 'zoom-in';
      posterEl.onclick = (e) => {
        e.stopPropagation();
        openPosterFullscreenFromSrc(posterEl.src);
      };
    } else {
      posterEl.style.display = 'none';
      posterEl.onclick = null;
      posterEl.style.cursor = 'default';
    }
    movieInfoModalEl.style.display = 'flex';
  }
  function initMovieTitle() {
    if (!miniControls || !window.fetch) return;
    fetch('/movieInfo')
      .then((r) => {
        //console.log('GET /movieInfo status', r.status);
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        //console.log('movieInfo response', data);
        if (!data || !data.found || !data.title) return;
        if (miniControls.querySelector('.movie-title')) return;
        movieInfoData = data;
        const el = document.createElement('div');
        el.className = 'movie-title';
        const span = document.createElement('span');
        span.textContent = data.year ? `${data.title} (${data.year})` : data.title;
        const infoBtn = document.createElement('button');
        infoBtn.type = 'button';
        infoBtn.className = 'movie-info-btn';
        infoBtn.title = 'Movie details';
        infoBtn.textContent = 'i';
        infoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openMovieInfoModal();
        });
        el.appendChild(span);
        el.appendChild(infoBtn);
        miniControls.prepend(el);
      })
      .catch((err) => {
        console.error('movieInfo error', err);
      });
  }
  initMovieTitle();
  const beep = (() => {
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAADEAAAAAACAgICA'); 
    return () => { if (notifyToggle && notifyToggle.checked) { audio.currentTime = 0; audio.play().catch(()=>{}); } };
  })();
  const smsSound = new Audio('/newsms.mp3');
  let lastSmsPlay = 0;
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  function fmtTime(s) {
    if (!isFinite(s)) return '00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }
  function setPlayIcon() {
    playPauseBtn.textContent = video.paused ? '▶' : '❚❚';
  }
  function updateTimeUI() {
    const cur = video.currentTime || 0;
    const dur = video.duration || 0;
    const rem = Math.max(dur - cur, 0);
    timeInfo.textContent = `${fmtTime(cur)} / ${fmtTime(dur)} (-${fmtTime(rem)})`;
    if (isFinite(dur) && dur > 0) {
      seekBar.value = Math.round((cur / dur) * 1000);
    } else {
      seekBar.value = 0;
    }
  }
  function safeSeek(t) {
    if (!isFinite(t)) return;
    const diff = Math.abs((video.currentTime || 0) - t);
    if (diff > 0.05) video.currentTime = t;
  }
  function applySubtitleOffset(ms) {
    subtitleOffsetMs = ms;
    if (!subtitleTrack || !subtitleTrack.cues) return;
    const cues = subtitleTrack.cues;
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      if (cue.__origStart == null) {
        cue.__origStart = cue.startTime;
        cue.__origEnd = cue.endTime;
      }
      cue.startTime = cue.__origStart + (subtitleOffsetMs / 1000);
      cue.endTime = cue.__origEnd + (subtitleOffsetMs / 1000);
    }
  }
  function setSubtitleFontSize(px) {
    let tag = document.getElementById('cueStyle');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'cueStyle';
      document.head.appendChild(tag);
    }
    const size = Math.max(12, Math.min(72, px));
    tag.textContent = `video::cue{font-size:${size}px !important;}`;
  }
  function isNearBottom(threshold = 40) {
    if (!messages) return true;
    const distance = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
    return distance <= threshold;
  }
  function scrollToBottom(smooth = true) {
    if (!messages) return;
    const behavior = smooth ? 'smooth' : 'auto';
    messages.scrollTo({ top: messages.scrollHeight, behavior });
    if (scrollBottomBtn) scrollBottomBtn.classList.remove('visible');
  }
  function addSystemMessage(text, avatarUrl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message';
    const av = document.createElement('div');
    av.className = 'avatar';
    av.innerHTML = `<img src="${avatarUrl || ''}" alt="">`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `<div class="meta"><span class="name">System</span><span>${new Date().toLocaleTimeString()}</span></div>
                        <div class="system">${text}</div>`;
    const wasAtBottom = isNearBottom();
    wrapper.appendChild(av); wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    if (wasAtBottom) {
      scrollToBottom(false);
    } else if (scrollBottomBtn) {
      scrollBottomBtn.classList.add('visible');
    }
  }
  function addChatMessage({ id, username, avatar, text, timestamp, type, url, replyTo }, mine = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message';
    if (id) wrapper.dataset.msgId = id;
    if (username) wrapper.dataset.username = username;
    if (type !== 'gif' && typeof text === 'string') wrapper.dataset.text = text;
    const av = document.createElement('div');
    av.className = 'avatar';
    av.innerHTML = `<img src="${avatar}" alt="">`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const time = new Date(timestamp || Date.now()).toLocaleTimeString();
    const parts = [];
    if (replyTo && replyTo.username && replyTo.text) {
      const snippetText = replyTo.text.length > 80
        ? replyTo.text.slice(0, 80) + '…'
        : replyTo.text;
      parts.push(
        `<div class="reply-snippet" data-reply-id="${replyTo.id || ''}">
           <div class="reply-snippet-author">${replyTo.username}</div>
           <div class="reply-snippet-text">${snippetText.replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]))}</div>
         </div>`
      );
    }
    let bodyHtml;
    if (type === 'gif' && url) {
      bodyHtml = `<div class="chat-gif"><img src="${url}" alt="GIF"></div>`;
    } else {
      const safeText = (text || '').replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]));
      bodyHtml = safeText;
    }
    parts.push(
      `<div class="meta"><span class="name">${username}</span><span>${time}</span></div>
       <div>${bodyHtml}</div>`
    );
    const wasAtBottom = isNearBottom();
    bubble.innerHTML = parts.join('');
    wrapper.appendChild(av);
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    if (wasAtBottom || mine) {
      scrollToBottom(false);
    } else if (scrollBottomBtn) {
      scrollBottomBtn.classList.add('visible');
    }
    if (!mine) {
      if (document.hidden) {
        const now = Date.now();
        if (notifyToggle.checked && now - lastSmsPlay > 2000) { 
          lastSmsPlay = now;
          smsSound.currentTime = 0;
          smsSound.play().catch(() => {});
        }
      } else {
        beep();
      }
    }
  }
  function sendGifMessage(url) {
    if (!url || roomLocked) return;
    const msg = {
      id: makeMessageId(),
      type: 'gif',
      url,
      timestamp: Date.now(),
      replyTo: replyTo ? { ...replyTo } : null
    };
    socket.emit('chatMessage', msg);
    addChatMessage({ username: me.username, avatar: me.avatar, ...msg }, true);
    replyTo = null;
    if (typeof clearReplyPreviewFn === 'function') clearReplyPreviewFn();
  }
  function attemptInitialJoin(username, avatar, onSuccess) {
    if (roomLocked) {
      return;
    }
    socket.emit('join', { username, avatar }, (res) => {
      if (!res || !res.ok) {
        const msg = res && res.error === 'room_full'
          ? 'Room is full (2 members max). Please try again later.'
          : 'Unable to join the room.';
        addSystemMessage(msg, null);
        return;
      }
      onSuccess();
    });
  }
  function loadProfile() {
    return {
      username: localStorage.getItem('ms_username') || '',
      avatar: localStorage.getItem('ms_avatar') || ''
    };
  }
  function saveProfile(username, avatar) {
    localStorage.setItem('ms_username', username);
    localStorage.setItem('ms_avatar', avatar);
  }
  function refreshJoinState() {
    const ok = usernameInput.value.trim().length > 0 && !!selectedAvatar;
    joinBtn.disabled = !ok;
  }
  socket.on('connect', () => {
    if (!joined || !me.username || !me.avatar || roomLocked) return;
    socket.emit('join', { username: me.username, avatar: me.avatar }, (res) => {
      if (!res || !res.ok) return;
      socket.emit('requestSync');
    });
  });
  fetch('/avatars').then(r => r.json()).then(({ avatars }) => {
    const stored = {
      username: localStorage.getItem('ms_username') || '',
      avatar: localStorage.getItem('ms_avatar') || ''
    };
    if (stored.username) usernameInput.value = stored.username;
    avatars.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<img src="${a.url}" alt="${a.name}"/>`;
      btn.addEventListener('click', () => {
        selectedAvatar = a.url;
        [...avatarGrid.children].forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
        refreshJoinState();
      });
      avatarGrid.appendChild(btn);
      avatarButtons.set(a.url, btn);
      if (stored.avatar && stored.avatar === a.url) {
        btn.classList.add('selected');
        selectedAvatar = a.url;
      }
    });
    refreshJoinState();
    if (stored.username && stored.avatar) {
      attemptInitialJoin(stored.username, stored.avatar, () => {
        me = { ...stored };
        joinModal.style.display = 'none';
        addSystemMessage(`${me.username} joined.`, me.avatar);
        initPlayer();
        initChat();
        joined = true;
        socket.emit('requestSync');
      });
    }
  });
  usernameInput.addEventListener('input', refreshJoinState);
  joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const avatar = selectedAvatar;
    if (!username || !avatar) return;
    if (!joined) {
      attemptInitialJoin(username, avatar, () => {
        me.username = username;
        me.avatar = avatar;
        localStorage.setItem('ms_username', me.username);
        localStorage.setItem('ms_avatar', me.avatar);
        joinModal.style.display = 'none';
        addSystemMessage(`${me.username} joined.`, me.avatar);
        initPlayer();
        initChat();
        joined = true;
        editingProfile = false;
        socket.emit('requestSync');
      });
    } else {
      me.username = username;
      me.avatar = avatar;
      localStorage.setItem('ms_username', me.username);
      localStorage.setItem('ms_avatar', me.avatar);
      joinModal.style.display = 'none';
      socket.emit('updateProfile', { username: me.username, avatar: me.avatar });
      addSystemMessage(`${me.username} profile updated.`, me.avatar);
      editingProfile = false;
    }
  });
  function updateUsedAvatars(inUse) {
    avatarButtons.forEach((btn) => btn.classList.remove('used-by-other'));
    const myAvatar = me.avatar || null;
    (inUse || []).forEach(url => {
      if (url && url !== myAvatar) {
        const btn = avatarButtons.get(url);
        if (btn) btn.classList.add('used-by-other');
      }
    });
  }
  socket.on('avatarsInUse', (arr) => {
    updateUsedAvatars(Array.isArray(arr) ? arr : []);
  });
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      editingProfile = true;
      usernameInput.value = me.username || '';
      [...avatarGrid.children].forEach(btn => {
        const img = btn.querySelector('img');
        const src = img ? img.getAttribute('src') : '';
        btn.classList.toggle('selected', src === me.avatar);
      });
      selectedAvatar = me.avatar || selectedAvatar;
      refreshJoinState();
      joinModal.style.display = 'flex';
    });
  }
  function setTab(which) {
    const isControls = which === 'controls';
    document.body.classList.toggle('tab-controls', isControls);
    document.body.classList.toggle('tab-chat', !isControls);
    if (tabChatBtn && tabControlsBtn) {
      tabChatBtn.setAttribute('aria-selected', String(!isControls));
      tabControlsBtn.setAttribute('aria-selected', String(isControls));
    }
  }
  if (tabChatBtn && tabControlsBtn) {
    tabChatBtn.addEventListener('click', () => setTab('chat'));
    tabControlsBtn.addEventListener('click', () => setTab('controls'));
    if (window.matchMedia && window.matchMedia('(max-width: 980px)').matches) {
      setTab('chat');
    }
  }
  function initPlayer() {
    video.src = '/stream';
    fetch('/subtitle.vtt', { method: 'HEAD' })
      .then(r => {
        if (r.ok) {
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.label = 'Subtitles';
          track.srclang = 'en';
          track.src = '/subtitle.vtt';
          track.default = true;
          track.addEventListener('load', () => {
            subtitleTrack = video.textTracks[0] || null;
            if (subtitleTrack) {
              subtitleTrack.mode = 'showing';
              subtitlesEnabled = true;
            }
            haveSubtitles = true;
          });
          video.appendChild(track);
        } else {
          haveSubtitles = false;
        }
      })
      .catch(() => { haveSubtitles = false; });
    function enforceSubtitleMode() {
      if (!subtitleTrack) return;
      subtitleTrack.mode = subtitlesEnabled ? 'showing' : 'disabled';
    }
    function startFullscreenSubtitleKeeper() {
      if (fullscreenSubtitleKeeper || !subtitleTrack) return;
      enforceSubtitleMode();
      fullscreenSubtitleKeeper = setInterval(enforceSubtitleMode, 1000);
    }
    function stopFullscreenSubtitleKeeper() {
      if (fullscreenSubtitleKeeper) {
        clearInterval(fullscreenSubtitleKeeper);
        fullscreenSubtitleKeeper = null;
      }
    }
    video.addEventListener('play', () => {
      setPlayIcon();
      socket.emit('play', { time: video.currentTime || 0, ts: Date.now() });
    });
    video.addEventListener('pause', () => {
      setPlayIcon();
      socket.emit('pause', { time: video.currentTime || 0, ts: Date.now() });
    });
    video.addEventListener('seeked', () => {
      socket.emit('seek', { time: video.currentTime || 0, ts: Date.now() });
    });
    video.addEventListener('timeupdate', updateTimeUI);
    video.addEventListener('loadedmetadata', updateTimeUI);
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) video.play(); else video.pause();
    });
    seekBar.addEventListener('input', () => {
      const dur = video.duration || 0;
      if (dur > 0) {
        const t = (parseInt(seekBar.value, 10) / 1000) * dur;
        safeSeek(t);
        updateTimeUI();
      }
    });
    seekBar.addEventListener('change', () => {
      socket.emit('seek', { time: video.currentTime || 0, ts: Date.now() });
    });
    volumeBar.addEventListener('input', () => {
      video.volume = parseFloat(volumeBar.value);
    });
    subToggleBtn.addEventListener('click', () => {
      if (!subtitleTrack) return;
      subtitlesEnabled = !subtitlesEnabled;
      subtitleTrack.mode = subtitlesEnabled ? 'showing' : 'disabled';
      subToggleBtn.style.opacity = subtitlesEnabled ? 1 : 0.6;
    });
    subFontSize.addEventListener('input', () => {
      setSubtitleFontSize(parseInt(subFontSize.value, 10));
    });
    setSubtitleFontSize(parseInt(subFontSize.value, 10));
    function adjustOffset(delta) {
      const val = parseInt(subOffsetInput.value || '0', 10) + delta;
      subOffsetInput.value = String(val);
      applySubtitleOffset(val);
      if (subBroadcast.checked) {
        socket.emit('subtitleOffsetChange', { offset: val });
      }
    }
    subBack1000.addEventListener('click', () => adjustOffset(-1000));
    subBack200.addEventListener('click', () => adjustOffset(-200));
    subFwd200.addEventListener('click', () => adjustOffset(200));
    subFwd1000.addEventListener('click', () => adjustOffset(1000));
    subOffsetInput.addEventListener('change', () => {
      const val = parseInt(subOffsetInput.value || '0', 10);
      applySubtitleOffset(val);
      if (subBroadcast.checked) socket.emit('subtitleOffsetChange', { offset: val });
    });
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const isVideoFs = document.fullscreenElement === video;
      video.controls = isVideoFs;
      if (isVideoFs) {
        startFullscreenSubtitleKeeper();
      } else {
        stopFullscreenSubtitleKeeper();
      }
    });
    video.addEventListener('webkitbeginfullscreen', () => {
      video.controls = true;
      startFullscreenSubtitleKeeper();
    });
    video.addEventListener('webkitendfullscreen', () => {
      video.controls = false;
      stopFullscreenSubtitleKeeper();
    });
    syncNowBtn.addEventListener('click', () => {
      socket.emit('requestSync');
    });
    setInterval(() => {
      socket.emit('timeSync', { time: video.currentTime || 0, isPlaying: !video.paused, ts: Date.now() });
    }, 2000);
    setInterval(() => {
      lastPingSend = Date.now();
      socket.emit('pingTime', lastPingSend);
    }, 5000);
  }
  socket.on('play', ({ time, ts }) => {
    if (ts < lastRemoteTs) return;
    lastRemoteTs = ts;
    safeSeek(time);
    if (video.paused) video.play().catch(()=>{});
  });
  socket.on('pause', ({ time, ts }) => {
    if (ts < lastRemoteTs) return;
    lastRemoteTs = ts;
    safeSeek(time);
    if (!video.paused) video.pause();
  });
  socket.on('seek', ({ time, ts }) => {
    if (ts < lastRemoteTs) return;
    lastRemoteTs = ts;
    safeSeek(time);
  });
  socket.on('timeSyncState', ({ time, isPlaying, ts }) => {
    const now = Date.now();
    const predicted = time + Math.max(0, (now - ts - latencyMs / 2)) / 1000;
    const diff = predicted - (video.currentTime || 0);
    if (Math.abs(diff) > 0.5) {
      safeSeek(predicted);
      if (isPlaying && video.paused) video.play().catch(()=>{});
      if (!isPlaying && !video.paused) video.pause();
    }
  });
  socket.on('requestSnapshot', () => {
    socket.emit('timeSync', { time: video.currentTime || 0, isPlaying: !video.paused, ts: Date.now() });
  });
  socket.on('pongTime', (t0) => {
    const rtt = Date.now() - t0;
    latencyMs = Math.round(rtt / 2);
  });
  socket.on('subtitleOffsetChange', ({ offset, username }) => {
    subOffsetInput.value = String(offset);
    applySubtitleOffset(offset);
    addSystemMessage(`Subtitle offset set to ${offset} ms by ${username}.`, me.avatar);
  });
  socket.on('systemMessage', ({ type, user, timestamp }) => {
    const text =
      type === 'join' ? `${user.username} joined.` :
      type === 'leave' ? `${user.username} left.` :
      type === 'profile' ? `${user.username} profile updated.` :
      '';
    if (text) addSystemMessage(text, user.avatar);
  });
  function initChat() {
    const emojiBtn = document.createElement('button');
    emojiBtn.type = 'button';
    emojiBtn.className = 'emoji-btn';
    emojiBtn.textContent = '😊';
    chatForm.insertBefore(emojiBtn, chatForm.firstChild);
    const replyPreviewEl = document.createElement('div');
    replyPreviewEl.className = 'reply-preview';
    replyPreviewEl.innerHTML = `
      <div class="reply-preview-inner">
        <div class="reply-preview-main">
          <div class="reply-preview-author"></div>
          <div class="reply-preview-text"></div>
        </div>
        <button type="button" class="reply-preview-cancel" aria-label="Cancel reply">✕</button>
      </div>
    `;
    chatForm.parentNode.insertBefore(replyPreviewEl, chatForm);
    const replyAuthorEl = replyPreviewEl.querySelector('.reply-preview-author');
    const replyTextEl = replyPreviewEl.querySelector('.reply-preview-text');
    const replyCancelBtn = replyPreviewEl.querySelector('.reply-preview-cancel');
    function clearReplyPreview() {
      replyTo = null;
      replyPreviewEl.style.display = 'none';
      replyAuthorEl.textContent = '';
      replyTextEl.textContent = '';
    }
    clearReplyPreviewFn = clearReplyPreview;
    replyCancelBtn.addEventListener('click', clearReplyPreview);
    function openReplyForMessage(msgEl) {
      const username = msgEl.dataset.username || '';
      const text = msgEl.dataset.text || '';
      const id = msgEl.dataset.msgId || '';
      if (!username || !text) return; 
      replyTo = { id, username, text };
      replyAuthorEl.textContent = username;
      const snippet = text.length > 80 ? text.slice(0, 80) + '…' : text;
      replyTextEl.textContent = snippet;
      replyPreviewEl.style.display = 'block';
      chatInput.focus();
    }
    let reactionPickerEl = null;
    let reactionTargetMsgId = null;
    let longPressTimer = null;
    function hideReactionPicker() {
      if (!reactionPickerEl) return;
      reactionPickerEl.style.display = 'none';
      reactionTargetMsgId = null;
    }
    function ensureReactionPicker() {
      if (reactionPickerEl) return;
      reactionPickerEl = document.createElement('div');
      reactionPickerEl.className = 'reaction-picker';
      REACTION_EMOJIS.forEach((em) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = em;
        b.addEventListener('click', () => {
          if (!reactionTargetMsgId) return;
          socket.emit('reactMessage', { msgId: reactionTargetMsgId, emoji: em });
          hideReactionPicker();
        });
        reactionPickerEl.appendChild(b);
      });
      document.body.appendChild(reactionPickerEl);
      document.addEventListener('click', (e) => {
        if (!reactionPickerEl || reactionPickerEl.style.display === 'none') return;
        if (reactionPickerEl.contains(e.target)) return;
        hideReactionPicker();
      });
    }
    function openReactionPicker(msgEl, x, y) {
      const msgId = msgEl && msgEl.dataset && msgEl.dataset.msgId;
      if (!msgId) return;
      reactionTargetMsgId = msgId;
      ensureReactionPicker();
      reactionPickerEl.style.display = 'flex';
      reactionPickerEl.style.left = `${x - 50}px`;
      reactionPickerEl.style.top = `${y - 40}px`;
    }
    messages.addEventListener('contextmenu', (e) => {
      const msgEl = e.target.closest('.message');
      if (!msgEl) return;
      if (msgEl.querySelector('.system')) return; 
      e.preventDefault();
      openReactionPicker(msgEl, e.clientX, e.clientY);
    });
    messages.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const msgEl = e.target.closest('.message');
      if (!msgEl || msgEl.querySelector('.system')) return;
      longPressTimer = setTimeout(() => {
        openReactionPicker(msgEl, touch.clientX, touch.clientY);
      }, 500);
    });
    ['touchend', 'touchmove', 'touchcancel'].forEach((ev) => {
      messages.addEventListener(ev, () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      });
    });
    function updateMessageReactions(msgId, counts) {
      if (!messages) return;
      let target = null;
      messages.querySelectorAll('.message[data-msg-id]').forEach((el) => {
        if (!target && el.dataset.msgId === msgId) target = el;
      });
      if (!target) return;
      const bubble = target.querySelector('.bubble');
      if (!bubble) return;
      const active = REACTION_EMOJIS
        .map((em) => ({ em, c: counts && typeof counts[em] === 'number' ? counts[em] : 0 }))
        .filter((x) => x.c > 0);
      let container = bubble.querySelector('.message-reactions');
      if (!active.length) {
        if (container) container.remove();
        return;
      }
      if (!container) {
        container = document.createElement('div');
        container.className = 'message-reactions';
        bubble.appendChild(container);
      }
      container.innerHTML = '';
      active.forEach(({ em, c }) => {
        const span = document.createElement('span');
        span.className = 'reaction';
        span.textContent = `${em} ${c}`;
        container.appendChild(span);
      });
    }
    socket.on('messageReactions', ({ msgId, counts }) => {
      if (!msgId || !counts) return;
      updateMessageReactions(msgId, counts);
    });
    messages.addEventListener('dblclick', (e) => {
      const msgEl = e.target.closest('.message');
      if (!msgEl) return;
      if (msgEl.querySelector('.system')) return;
      openReplyForMessage(msgEl);
    });
    let replyHighlightTimeout = null;
    messages.addEventListener('click', (e) => {
      const snippet = e.target.closest('.reply-snippet');
      if (!snippet) return;
      const targetId = snippet.dataset.replyId;
      if (!targetId) return;
      const all = messages.querySelectorAll('.message[data-msg-id]');
      let target = null;
      all.forEach((el) => {
        if (el.dataset.msgId === targetId && !target) target = el;
      });
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messages.querySelectorAll('.message.reply-target').forEach(el => el.classList.remove('reply-target'));
      target.classList.add('reply-target');
      if (replyHighlightTimeout) clearTimeout(replyHighlightTimeout);
      replyHighlightTimeout = setTimeout(() => {
        target.classList.remove('reply-target');
      }, 1400);
    });
    if (chatPanel && !scrollBottomBtn) {
      scrollBottomBtn = document.createElement('button');
      scrollBottomBtn.type = 'button';
      scrollBottomBtn.className = 'scroll-bottom-btn';
      scrollBottomBtn.title = 'Scroll to latest messages';
      scrollBottomBtn.textContent = '↓';
      chatPanel.appendChild(scrollBottomBtn);
      scrollBottomBtn.addEventListener('click', () => {
        scrollToBottom(true);
      });
    }
    messages.addEventListener('scroll', () => {
      if (!scrollBottomBtn) return;
      if (isNearBottom()) {
        scrollBottomBtn.classList.remove('visible');
      } else {
        scrollBottomBtn.classList.add('visible');
      }
    });
    function hideEmojiGifPicker() {
      if (emojiGifPicker) emojiGifPicker.classList.remove('open');
    }
    function ensureEmojiGifPicker() {
      if (emojiGifPicker) return;
      emojiGifPicker = document.createElement('div');
      emojiGifPicker.className = 'emoji-gif-picker';
      emojiGifPicker.innerHTML = `
        <div class="egp-tabs">
          <button type="button" data-tab="emoji" aria-selected="true">Emoji</button>
          <button type="button" data-tab="gif" aria-selected="false">GIFs</button>
        </div>
        <div class="egp-body">
          <div class="egp-emoji-panel"></div>
          <div class="egp-gif-panel" hidden>
            <input type="text" class="egp-gif-search" placeholder="Search GIFs" autocomplete="off" />
            <div class="egp-gif-results"></div>
          </div>
        </div>
      `;
      document.body.appendChild(emojiGifPicker);
      const tabs = emojiGifPicker.querySelectorAll('.egp-tabs button');
      emojiTabBtn = tabs[0];
      gifTabBtn = tabs[1];
      emojiPanelEl = emojiGifPicker.querySelector('.egp-emoji-panel');
      gifPanelEl = emojiGifPicker.querySelector('.egp-gif-panel');
      gifSearchInput = emojiGifPicker.querySelector('.egp-gif-search');
      gifResultsEl = emojiGifPicker.querySelector('.egp-gif-results');
      const emojiCatsEl = document.createElement('div');
      emojiCatsEl.className = 'egp-emoji-cats';
      const emojiGridEl = document.createElement('div');
      emojiGridEl.className = 'egp-emoji-grid';
      emojiPanelEl.appendChild(emojiCatsEl);
      emojiPanelEl.appendChild(emojiGridEl);
      let activeEmojiGroup = 0;
      function renderEmojiGrid(idx) {
        emojiGridEl.innerHTML = '';
        const group = EMOJI_GROUPS[idx];
        group.items.forEach(ch => {
          if (!ch) return;
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = ch;
          b.addEventListener('click', () => {
            chatInput.value += ch;
            chatInput.focus();
            hideEmojiGifPicker(); 
          });
          emojiGridEl.appendChild(b);
               });
      }
      EMOJI_GROUPS.forEach((group, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'egp-emoji-cat-btn';
        b.textContent = group.icon;
        b.setAttribute('aria-label', group.name);
        b.setAttribute('aria-selected', String(i === 0));
        b.addEventListener('click', () => {
          activeEmojiGroup = i;
          [...emojiCatsEl.children].forEach((btn, idx) => {
            btn.setAttribute('aria-selected', String(idx === i));
          });
          renderEmojiGrid(i);
        });
        emojiCatsEl.appendChild(b);
      });
      renderEmojiGrid(activeEmojiGroup);
      function selectTab(which) {
        const showEmoji = which === 'emoji';
        emojiTabBtn.setAttribute('aria-selected', String(showEmoji));
        gifTabBtn.setAttribute('aria-selected', String(!showEmoji));
        emojiPanelEl.hidden = !showEmoji;
        gifPanelEl.hidden = showEmoji;
      }
      emojiTabBtn.addEventListener('click', () => selectTab('emoji'));
      gifTabBtn.addEventListener('click', () => selectTab('gif'));
      function loadGifs(query) {
        if (!query) query = 'reaction';
        const url = `/gifs?q=${encodeURIComponent(query)}`;
        fetch(url)
          .then(r => (r.ok ? r.json() : null))
          .then(json => {
            if (!json || !Array.isArray(json.data)) return;
            gifResultsEl.innerHTML = '';
            json.data.forEach(item => {
              const src =
                item.images &&
                (item.images.fixed_width_small || item.images.fixed_width) &&
                (item.images.fixed_width_small.url || item.images.fixed_width.url);
              if (!src) return;
              const img = document.createElement('img');
              img.src = src;
              img.alt = item.title || 'GIF';
              img.addEventListener('click', () => {
                sendGifMessage(src);
                hideEmojiGifPicker(); 
              });
              gifResultsEl.appendChild(img);
            });
          })
          .catch(() => {});
      }
      gifSearchInput.addEventListener('input', () => {
        const q = gifSearchInput.value.trim();
        clearTimeout(gifSearchTimeout);
        gifSearchTimeout = setTimeout(() => loadGifs(q), 400);
      });
      loadGifs('reaction');
      document.addEventListener('click', (e) => {
        if (!emojiGifPicker || !emojiGifPicker.classList.contains('open')) return;
        if (emojiGifPicker.contains(e.target) || e.target === emojiBtn) return;
        hideEmojiGifPicker();
      });
    }
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ensureEmojiGifPicker();
      emojiGifPicker.classList.toggle('open');
    });
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      const msg = {
        id: makeMessageId(),
        type: 'text',
        text,
        timestamp: Date.now(),
        replyTo: replyTo ? { ...replyTo } : null
      };
      socket.emit('chatMessage', msg);
      addChatMessage({ username: me.username, avatar: me.avatar, ...msg }, true);
      chatInput.value = '';
      clearReplyPreview();
    });
    let typingTimeout;
    chatInput.addEventListener('input', () => {
      socket.emit('typing');
    });
    socket.on('typing', ({ username }) => {
      typing.textContent = `${username} is typing...`;
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => typing.textContent = '', 1200);
    });
    socket.on('chatMessage', (msg) => {
      addChatMessage(msg, false);
    });
  }
})();