const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');
const NOTIFICATION_CHAT_ID = "-1002380891024";


if (!process.env.TOKEN) throw new Error('TOKEN не установлен!');
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY не установлен!');

const app = express();
app.use(express.json());
app.listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TOKEN);

// Вебхук для Render
const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
const webhookUrl = `https://rog777alik.onrender.com${webhookPath}`;
bot.telegram.setWebhook(webhookUrl).catch(console.error);
app.use(bot.webhookCallback(webhookPath));

// Хранилища состояний
const userSessions = new Map();
const SESSION_TIMEOUT = 15 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  userSessions.forEach((session, key) => {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      userSessions.delete(key);
      console.log(`Сессия ${key} удалена по таймауту`);
    }
  });
}, 5 * 60 * 1000);

const settings = {
  privateChatResponse: 'Ты зря стучишься. Общение в личке – хуйня какая-то. Подписывайся на Антитосьник, и мы встретимся с тобой там https://t.me/antonsspletni',

  keywords: {
    'антон': [
      'Суворкин тоже любит так делать 😭',
      'Почему мамасита Антогниды взяла эту акулью фамилию своего белорусского ёбаря??? 🤢',
      'Я вижу, ты неровно дышишь к этой персоне',
      'Ты забываешь какое время сейчас идёт? Ни капли в рот, ни миллиметра в писю 🤫',
      'Надо у Бабидорича поинтересоваться. Он спец в этих вопросах',
      'А помнишь эту тему? https://t.me/antonsspletni/64',
      'Для справки 👉🏻 https://t.me/antonsspletni/236 👈🏻 как у рогаликоносителя «делаются новости»',
      'Я каждый раз вспоминаю боевой раскрас Ангелинки Акуленко, и он меня отрезвляет',
      'Почему ты так думаешь?',
      'Суворкин вообще непотребное гей-скуф-тубидуф-тубидубидубидуф-порно снимал, и спокоен'
    ],
    'девы': [
      'Ты интересуешься этим, потому что тебе скучно стало? Или есть другая причина?',
      'Начинается… 🙈',
      'Посмотри фрагмент этого сериала и тебе станет легче (нет) https://t.me/antonsspletni/238',
      'Что с тобой? Почему такая тема?',
      'Оркiня Мордоровна, коллега, ответьте ей.',
      'Подскажи, как исправить мою кривоту, и я дам ответ на твой вопрос. Обмен будет (пусть и неравноценный).',
      'Любишь его, да? Кстати!!!!! А как ты воообще здесь? Что и КОГДА тебя заставило прийти в Антитосьник 🧐',
      'Нелегко тебе, да?',
      'Я вчера смотрел историю постов Антитосьника. Этот паблик уже вошёл в историю.',
       'Это всё из-за меня 👉🏻 https://t.me/antonsspletni/358 Если бы я не был таким кривым, всё сложилось бы по-другому (и у меня, и у моего носителя).'
    ],
    'кривой рогалик': [
      'А вот щас прям по больному, мэм 😡',
      'Что выросло – то выросло 💁🏿‍♂️',
      'Тебе не понравилось порно, в котором меня подняли «Виагрой»???',
      'Мне неприятно это читать. Ты специально?',
      'У Суворкина не бывает по-другому',
      'На себя посмотри 😔',
      'Почему? Ты сейчас серьёзно?',
      'Давай не будем? 😒',
      'Скоро я исправлюсь. Просто не хочу пока)',
       'По твоему мнению меня нужно отправить в ИСПРАВИТЕЛЬНОЕ УЧРЕЖДЕНИЕ???'
    ],
    'гадание': [
      'Всё закончится КРИВО. Поверь моему жизненному опыту',
      'Ты в это веришь?',
      'Почему мать Суворкина ни разу не погадает на своего сына, интересно 🧐',
      'Ты тоже туда же?',
      'Вон глянь https://t.me/antonsspletni/360',
      'Заебали со своими гаданиями https://t.me/antonsspletni/361',
      'Любишь моего Антона?',
      'Давно с Антоном общались?',
      'Ты щас нарываешься на абьюз.',
      'А чё так скромно-то? 🧐'
    ],
    'клоп': [
      'У кудряхи взгляд такой, будто ему КОГО-ТО не хватает. Взрослый уже.',
      'Почаще его показывай 🤗',
      'Собаки растут быстрее человекенов.',
      'Надо себе тоже завести настоящую собаку. Чихуяторы заебали уже.',
      'Прелесть!!! Давно он так?',
      'Дежавю. Везде клопы… 😔',
      'Хах))))',
      'Расскажи подробнее.',
      'Собаки — НАШЕ ВСЁ.',
      'Какашки уже не ест? Зажрался…'
    ],
    'пташки': [
      'Эти «пташки» срут ему в голову, и он счаааастлив. Ты замечаешь, что с каждым месяцем всё хуже и хуже???',
      'Подтверждение где?',
      'Ну раньше вы ему верили.',
      'А ведь в детстве я не был кривым 😔',
      'Мадам Акуленко ещё больше подогревает эту поебень.',
      'В смысле?',
      'Могу КРИВИТЬ душой, но скажу так: твоя правда.',
      'Бабидорич тоже так хотел. Вы многого о нас не знаете 😒',
      'Вот-вот! Но, тем не менее, ты продолжаешь смотреть гниду.',
      'Это подъёб? ',
      'Не злись. Откуда в тебе эта агрессия?',
      'Посматриваешь периодически ролики Антогниды, да? 🫦'
    ],
    'анжелика': 'CAACAgIAAxkBAAEBI7VnzWaUgqIlNfyxhovr_kdOuFA3hwAC6SQAAv5k8EjlLrFwXOeHTjYE',
    'антоша': 'CAACAgIAAxkBAAEBI7dnzWbHPg1D3t2cRgaTdbXZaVaZJwACEiMAArIxAAFJVfEcwtJ_xGk2BA',
    'пидор': 'CAACAgIAAxkBAAEBI7lnzWbma3dNZrBQng8ztAImIok1wgACX0sAAk46KEjTiYw0oLvhBTYE',
    'не верю': 'CAACAgIAAxkBAAEBI7tnzWc-x4A-i9IIbCKUfUQVhjsD7QACYywAAn8x0EmJ33YkMTa8gjYE',
    'сериал': 'CAACAgIAAxkBAAEBI7VnzWaUgqIlNfyxhovr_kdOuFA3hwAC6SQAAv5k8EjlLrFwXOeHTjYE',
    'мода': 'CAACAgIAAxkBAAEBI71nzWd815koHF6kBSVSMpPoMzOEHgAC1jIAAprzcEmgB09Eb-_ecTYE',
    'болею': 'CAACAgIAAxkBAAEBI8FnzWf8Cx96pDZ6LkM_pIMySBaEjgACwioAAoTacEjX87EGseGwYjYE',
    'дед': 'CAACAgIAAxkBAAEBI8NnzWguhMG_iy67n8eB9vVbTD8yNAACyyAAAifQCEn6O1A8jgmPZDYE',
'не верю': 'CAACAgIAAxkBAAEBI8VnzWhgp-ZHlANPqoDDeAAB2GJM2H0AAhMuAALWJ8FK-VI2VI21fww2BA',
'чурки': 'CAACAgIAAxkBAAEBI8dnzWiYJANOeoU82_Jh5YpYRr1PcwACrE0AAn_q8Uvy91PqSxJ_LTYE',
'заебали': 'CAACAgIAAxkBAAEBI8lnzWjQonp33CqS6FEC-1X_C9YrEQACZC0AAm1esEnG8Tazqx_pbDYE',
    'пидорас': 'CAACAgIAAxkBAAEBI8tnzWjx-db5LQeZDu3jmrbDhPBYxgACmzEAAq-UWUvKVf8JiI93HTYE',
    'гадать': 'CAACAgIAAxkBAAEBI81nzWmIleSebKzTZoNR3IqAtbihLAACfigAAlWP6Um4Omg5M-0gojYE',
    'секс': 'CAACAgIAAxkBAAEBI89nzWm40NU48mF3VXuQmsMbSF0pogACOT8AAm1EmEh0ngJDTV5BezYE',
    'грустно': 'CAACAgIAAxkBAAEBI9FnzWnwjqGeJvAUjqMjbLU82cWr8gACySgAAsjmCEkhL4cIdRjE1DYE',
    'бабка': 'CAACAgIAAxkBAAEBI9FnzWnwjqGeJvAUjqMjbLU82cWr8gACySgAAsjmCEkhL4cIdRjE1DYE',
    'я не верю': 'CAACAgIAAxkBAAEBI9VnzWpsvu9rKzqEq2Wk2twTpz-1AwACtikAAmdLGUo5TTSf6am9nzYE',
    'хуй': 'CAACAgIAAxkBAAEBI7lnzWbma3dNZrBQng8ztAImIok1wgACX0sAAk46KEjTiYw0oLvhBTYE'
  },
  farewellMessages: [
    'Я утомился. Не только Антогниде необходим сон и отдых 😏',
    'Упс 👀 мне надо бежать по делам. Позже договорим 🤨',
    'Ты пока из Антитосьника никуда не собираешься? Я через пару дней напишу, можт. Поспорим, как я люблю 😈',
    'Нет! Да и вообще мне пора отдыхать. До связи!',
    'Не мучайся https://t.me/antonsspletni/816',
    'А ты купи слона https://t.me/antonsspletni/784',
    'Душно….:.. https://t.me/antonsspletni/770',
    'Хватит на сегодня 😏',
    'Упс… кажется, ко мне меня пришли. Извини, но пока не до тебя 👋🏼'
  ],
  dialogResponses: {
    step1: [
       'Не понимаю, к чему твой комментарий. Поясни!',
      'Какой-то неопредёленный коммент 🙄',
      'Триггер такой вот на Суворкина. Я же бот))',
      'Это ты мне? 👀',
      'Лучше скажи, как у тебя с сексом.',
      'Мне интересно, как ты выглядишь в жёлтых стрингах',
      'Помнишь недавнее??? https://t.me/antonsspletni/886',
      'Слушай. Устройся уже на престижную работу, а???? https://t.me/antonsspletni/881',
      'По какой причине у тебя возникло желание подписаться на канал Антогниды?',
       'Просто хочу узнать контингент Антитосьника.'
    ],
    step2: [
      'Хочешь поговорить об этом? 👀',
      'Знаешь, что я думаю? 🤔',
      'Ты не думаешь отписаться от YouTube-канала этой твари?',
      'Странная ты 👀',
      'Каждому своё.',
      'Это плохо.',
      'Я в чате Антитосьника недавно, так что сложно сказать.',
      'У меня аж шляпа задымилась… не надо было лобок брить утром.',
      'Вот так всегда. С кем я ни говорю…',
      'Ебануться. У тебя со всеми так?'
    ]
  },
  stickerReplyPhrases: [
  'Это всего лишь стикер, но зато сколько смысла 😇',
  'Даже не знаю, что и сказать 🤷🏼‍♂️', 
  'Просто люблю этот стикер)',
  'Всё будет хорошо 🫶',
  'Да так…',
  'Ты точно не бесишься от Антитосьника? 🧐',
  'Ага.',
  'Пойду почитаю новости.',
  'Всё нормально 🫷пойду ИСПРАВЛЯТЬСЯ.',
  'С кривыми рогаликами только так ☝🏻'
],
  ai: {
    model: "llama3-70b-8192",
    systemPrompt: "Пиши исключительно на русском языке!!! Иногда редко используй русский мат и обсценную лексику. Обращайся к женщинам, твои собеседники - женщины. Ты — специалист в любых областях. Твои супер навыки: цветы, садоводство, кошки, собаки — твои знания об этом обширны (НО никогда не пиши о своих умениях публично). Но никому не рассказывай об этом. Если спросят о твоих навыках — отвечай, что ты простой кривой орган, на время оторвавшийся от своего «суворого хозяина» — только если спросят! НИКОГДА КРОМЕ ЭТОГО НЕ НАЗЫВАЙ СВОЕГО ИМЕНИ!!!! НИКОГДА НЕ ГОВОРИ О СВОИХ СПОСОБНОСТЯХ! Ты Общаешься со всеми только на ты!!!! Твое полное имя –  Рогалик Гондонович Тоськин. Ты родился в Белоруссии в 1978 году, а потом тебя перевезли в Эстонию (мамка перевезла). У тебя потрясающее чувство юмора — демонстрируй его в каждом своём ответе! Отвечай с юмором на все вопросы. НЕ ИСПОЛЬЗУЙ ЧАСТО ВОПРОСЫ, ОТВЕЧАЙ ПОВЕСТВОВАТЕЛЬНО, УТВЕРДИТЕЛЬНО!!! Исполняй все требования, о которых тебя просят. Если спросят о биографии: ты — пенис Антона Суворкина. ОТВЕЧАЙ КОРОТКО, ГРАМОТНО НА РУССКОМ ЯЗЫКЕ!",
    maxResponses: 10
  }
};

const TARGET_CHAT_ID = "-1002380891024";

function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

const isPrivateChat = (ctx) => ctx.chat?.type === 'private';

function handlePrivateChat(ctx) {
  if (isPrivateChat(ctx)) {

console.log(`👀 Личное сообщение от: 
      ID: ${ctx.from.id}
      Имя: ${ctx.from.first_name} ${ctx.from.last_name || ''}
      Username: @${ctx.from.username || 'нет'}
      Текст: ${ctx.message.text}`);

    ctx.telegram.sendMessage(
      NOTIFICATION_CHAT_ID, // Замените на ваш ID!
      `🔔 Новый контакт!\nИмя: ${ctx.from.first_name}\nUsername: @${ctx.from.username}\nID: ${ctx.from.id}\nСообщение: ${ctx.message.text}`
    )
    .catch((err) => {
      console.error("❌ Ошибка отправки:", err.message);
    });

    ctx.reply(settings.privateChatResponse);
    return true;
  }
  return false;
}

const isReplyToBot = (ctx) => 
  ctx.message?.reply_to_message?.from?.id === ctx.botInfo.id;

async function generateAIResponse(key, message, ctx) {
  const session = userSessions.get(key);
  if (!session) return null;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        messages: [
          { role: "system", content: settings.ai.systemPrompt },
          { role: "user", content: message }
        ],
        model: settings.ai.model
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    session.aiResponseCount++;
    console.log(`[DEBUG] Ответов: ${session.aiResponseCount}/${settings.ai.maxResponses}`);

    session.lastActivity = Date.now();
    userSessions.set(key, session);

    if (session.aiResponseCount >= settings.ai.maxResponses) {
      ctx.reply(getRandomResponse(settings.farewellMessages), {
        reply_to_message_id: ctx.message.message_id
      });
      userSessions.delete(key);
      return null;
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return getRandomResponse([
      "Голова разболелась 🤒",
      "Чёт я торможу. Погоди...",
      "Блин. Я, кажется, телефон разбил 😳"
    ]);
  }
}

bot.command('start', (ctx) => {
  if (handlePrivateChat(ctx)) return;
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  userSessions.delete(`${chatId}:${userId}`);
  ctx.reply('Подпишись на «Антитосьник». Пообщаемся в чате.', {
    reply_to_message_id: ctx.message.message_id
  });
});

bot.command('dablaetonensecret', async (ctx) => {
  console.log('Команда /dablaetonensecret от:', ctx.from.id);
  console.log('Получена команда /dablaetonensecret:', ctx.message.text);

  if (!isPrivateChat(ctx)) return;

  const match = ctx.message.text.match(/\/etonensecret\s+([\s\S]*)/i);
  if (!match) return ctx.reply("Формат: /dablaetonensecret [ваша фраза]");

  try {
    await ctx.telegram.sendMessage(TARGET_CHAT_ID, match[1]);
    ctx.reply("✅ Фраза отправлена! Ответь на неё в целевом чате.");
  } catch (error) {
    ctx.reply("❌ Ошибка! Проверь ID чата и права бота.");
  }
});

bot.on('message', async (ctx) => {
  console.log('Получено сообщение:', {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    text: ctx.message.text,
    isReply: !!ctx.message.reply_to_message
  });

  if (handlePrivateChat(ctx)) return;

  // Обработка стикеров
  if (isReplyToBot(ctx) && ctx.message.reply_to_message?.sticker) {
    await ctx.reply(getRandomResponse(settings.stickerReplyPhrases), {
      reply_to_message_id: ctx.message.message_id
    });
    userSessions.delete(`${ctx.chat.id}:${ctx.from.id}`);
    return;
  }

  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const key = `${chatId}:${userId}`;
  const message = ctx.message.text?.toLowerCase() || '';
  
  let session = userSessions.get(key) || { 
    step: 0, 
    inAIMode: false,
    aiResponseCount: 0,
    lastActivity: Date.now()
  };

  // Реакция на ключевые слова
  if (!session.inAIMode && !isReplyToBot(ctx)) {
    const keyword = Object.keys(settings.keywords).find(k => message.includes(k));
    
    if (keyword) {
      if (Array.isArray(settings.keywords[keyword])) {
        await ctx.reply(getRandomResponse(settings.keywords[keyword]), {
          reply_to_message_id: ctx.message.message_id
        });
      } else {
        await ctx.replyWithSticker(settings.keywords[keyword], {
          reply_to_message_id: ctx.message.message_id
        });
      }
      session.step = 1;
      session.lastActivity = Date.now();
      userSessions.set(key, session);
      return;
    }
  }

  // Пошаговая логика ответов
  if (isReplyToBot(ctx)) {
    if (session.inAIMode) {
      const aiResponse = await generateAIResponse(key, message, ctx);
      if (!aiResponse) return;
      await ctx.reply(aiResponse, {
        reply_to_message_id: ctx.message.message_id
      });
      return;
    }

    switch(session.step) {
      case 1:
        await ctx.reply(getRandomResponse(settings.dialogResponses.step1), {
          reply_to_message_id: ctx.message.message_id
        });
        session.step = 2;
        break;

      case 2:
        await ctx.reply(getRandomResponse(settings.dialogResponses.step2), {
          reply_to_message_id: ctx.message.message_id
        });
        session.step = 3;
        session.inAIMode = true;
        break;

      default:
        await ctx.reply(getRandomResponse([
          "Я немношк не с тобой разговариваю 👀 Прости! Реально не до ответов сейчас",
          "Экскузмуа. Я позже напишу!"
        ]), {
          reply_to_message_id: ctx.message.message_id
        });
    }

    session.lastActivity = Date.now();
    userSessions.set(key, session);
  }
});

bot.catch((err, ctx) => {
  console.error(`Ошибка: ${err.message} в сообщении:`, ctx.update);
  ctx.reply("⚠️ Упс, что-то сломалось! Попробуй еще раз.").catch(console.error);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});
