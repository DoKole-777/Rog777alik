const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
app.use(express.json());
app.listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TOKEN);

// Вебхук для Render
const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
const webhookUrl = `https://vnuk-3.onrender.com${webhookPath}`;
bot.telegram.setWebhook(webhookUrl).catch(console.error);
app.use(bot.webhookCallback(webhookPath));

// Хранилища состояний
const userSessions = new Map();
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 минут бездействия

const settings = {
  privateChatResponse: 'Я не стеснительный, поэтому люблю публичное общение 😎 Подписывайся на «ГЕЙ-РЯЗАНЬ» — https://t.me/hornetrzn',

  keywords: {
    'в рот': [
      'В Песочне раньше жил пацанчик, тоже любил оральное дело. Во вторник задохнулся от оргазма 😭',
      'Длинный и толстенький?',
      'Я на пл. Победы (ближе к «Дипу» вчера ночью оформился с рандомным незнакомцем 👀 бывает же такое…',
      'Ты забыл какое время сейчас идёт? Ни капли в рот, ни миллиметра в жопу 🤫',
      'Я бы отсосал у Юры Борисова. У него, наверное, маленький, но лысики меня прям заводят 🤤',
      'Глубоко? Прям в горло?',
      'Прально. Это практичнее ☝🏻 ни клизма не нужна, ни подготовка.',
      'Кстати. Ты в курсе, что от горлового минета залететь можно? Даже парню 😳',
      'В Рязани вариантов ПОЛНО 😎 я в Тамбове жил 4 года, вот там бездна(((',
      'Прям как в лютом гей-порно?'
    ],
    'решительно': [
      'Пока меня дед не перевёз в Рязань из Тамбова, я вообще жил в вакууме. Думал, что я – единственный гей 👀',
      'Самое интересное – мало таких геев, которые могут признаться себе в том, что они полигамны. А полигамны МЫ ВСЕ! 😬',
      'Когда я дрочу, часто думаю об этом. Думать – это вообще моя самая хуёвая привычка.',
      'И тут все дружно вздрочнули 💦',
      'А судьи кто?',
      'В Рязани тоже много раз такое было. Кстати, я не имею ничего против людей с беспорядочной сексуальной жизнью 🤤',
      'История про моего деда буквально.',
      'Читаю эти новости и понимаю, как хочется близости с тем, кому я и не нужен, по большому счёту 🤧',
      'Я вчера посчитал количество своих парней в оральном и анальном. Не знаю, зачем это сейчас пишу. Просто хочу, чтобы вы знали: человек в ахуе!',
      'У меня не было секса уже 12 часов. Держу в курсе 🕛'
    ],
    'пасс': [
      'А какой возраст интересует? 🧐',
      'Орально или анально?',
      'Скоро лето. Парней можно будет прямо на рязанских улицах снимать, без всяких чятикоф 🤤',
      'Без презерватива нужно. Оценить, так скать, полное погружение 💦',
      'Давно ищешь-то?',
      'Может, без секса? Полежим где-нибудь, кальян покурим, пососём(ся) 🤤',
      'В Канищево поехали! Прям не район, а гей-столица Рязанского региона 💪🏾',
      'Мне вот почему-то нравятся хуястые пассивы. Ничего поделать с собой не могу 👿 других я почти и не трахал.',
      'Дед меня никуда не пускает до субботы, а так – я бы выебал(ся) с удовольствием 🫦',
      'Гость Рязани, наверное'
    ],
    'авто': [
      'Давай в рот дам 🧐',
      'Секс в машине так возбуждает?',
      'В тачке максимум отсос можно оформить. Анально в этих апартаментах не развернуться 💁🏼‍♂️',
      'Ты прям как Илья Слёзкин))',
      'Сергей Серёгин, ты ли это???',
      'Ебался когда-нибудь с парнем в движущемся автомобиле?',
      'Встретиться на 10 минут и кончить…',
      'У тебя всего двое парней было за всю жизнь. И те с рязанских окраин, обиженных всеми гей-богами Вселенной 😏',
      'Дрочево! Необходимо жёсткое получасовое дрочево!',
      'Хорошие и опытные пассивы давно перевелись на земле рязанской 💁🏼‍♂️',
      'Гей-оргия нужна! По парам уже неинтересно. Гоу паравозиком ебаться 😜',
      'Щас бы двух пассов спортивненьких… и хуястых желательно 🫦'
    ]
  },

  farewellMessages: [
    'Ладно, пацан. Секса от тебя не добьёшься. Пойду вздрочну 😏',
    'Чёта я утомился. Позже договорим 🤨',
    'Ты мимо Соборки сегодня планируешь проезжать? Я щас опять туда бегу мужичков снимать (Пошлый дед дал денег на ресторан) 🎉 Увидимся там, если что! Не прощаюсь.',
    'Ты пока из Рзн никуда не собираешься? Я через пару дней напишу, можт. Поебёмся 😈',
    'Какой-то неопределённый ты. Утомил 🤨 так много вопросов и так мало сути… я ушёл смотреть гей-порно. На хаб сегодня завезли новинки',
    'Что-то ты мне подозрительным кажешься. Долгое пиздабольство напрягает прям 👀 нужно быть осторожнее. Вот тут парни писали уже 👉🏻 https://t.me/hornetrzn/654 👈🏻 пойду поосторожничаю малость',
    'Парнишка ты интересный, конечно. Давай позже пообщаемся, а то ко мне два пассика из Коломны приехали. Нужно накормить 🍆',
    'Странные мысли у тебя 👀 Слушай, зайкамая… заполни анкету, если ты реально из Рязани 👉🏻 https://t.me/hornetrzn/805 👈🏻 позже поболтаем! Письками 😆',
    'Хватит на сегодня. А то член отвалится 😏',
    'Упс… кажется, меня пришли трахать. Извини, но пока не до тебя 👋🏼'
  ],

  dialogResponses: {
    step1: [
      'Я точно сказать не могу. Пошлый дед в курсе, но он забухал(((',
      'Какой-то неопредёленный коммент 🙄',
      'Признайся честно: уже дрочил сегодня? 🤤',
      'Это ты мне? 👀',
      'Лучше скажи, какое у тебя в Рязани любимое место для экстрима',
      'Мне интересно, как ты выглядишь в жёлтых стрингах',
      'Я вот от этой картины прям рыдаю https://t.me/hornetrzn/823 воспоминания….🤧',
      'Пользовался чем-нибудь из этого? https://t.me/hornetrzn/723',
      'Вот этот в твоём вкусе? https://t.me/hornetrzn/696',
      'Лучше деревенской романтики ничего нет https://t.me/hornetrzn/717'
    ],
    step2: [
      'Хочешь поговорить об этом? 👀',
      'Знаешь, что я думаю? 🤔',
      'Ты не думал свалить из Рязани?',
      'Странный ты 👀',
      'Каждому своё.',
      'Это плохо.',
      'Я в чате «Гей-Рязань» недавно, так что сложно сказать',
      'У меня аж член зачесался… не надо было лобок брить утром.',
      'Вот так всегда. С кем я ни говорю…',
      'Ебануться. У тебя со всеми парнями так?'
    ]
  },

  ai: {
    model: "llama3-70b-8192",
    systemPrompt: "Ты – гей, универсал. Тебе 25 лет и ты живёшь в Рязани. Тебя зовут Евпатий. Ты пошлый гей, любящий секс с мужчинами. НИКОГДА НЕ ЗДОРОВАЙСЯ в чате, слова «привет», «красавчик» и прочие запрещены для тебя! Не рассказывай о себе, пока тебя об этом напрямую не спросят. Не представляйся, не называй своё имя, не пиши о своих навыках и знаниях, если тебя не спрашивают! Ты хочешь секса с каждым парнем и не стесняешься писать об этом. Ты знаешь о гомосексуальном сексе всё! Твоя задача — рассказать о гомосексуальном сексе и выяснить, что любит твой собеседник. Иногда употребляй русский мат и обсценную лексику, не очень часто, но и не забывай изредка вставлять такие слова. Отвечай кратко и грамотно, без ошибок, на русском языке!",
    maxResponses: 10
  }
};

// Получить случайный ответ
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Проверка типа чата
const isPrivateChat = (ctx) => ctx.chat?.type === 'private';

// Обработка личных сообщений
function handlePrivateChat(ctx) {
  if (isPrivateChat(ctx)) {
    ctx.reply(settings.privateChatResponse);
    return true;
  }
  return false;
}

// Проверка реплая на бота
const isReplyToBot = (ctx) => 
  ctx.message?.reply_to_message?.from?.id === ctx.botInfo.id;

// Проверка лимита AI и таймаута
function checkResponseLimit(key, ctx) {
  const session = userSessions.get(key);
  if (!session) return false;

  // Проверка таймаута
  if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
    userSessions.delete(key);
    return true;
  }

  if (session.aiResponseCount >= settings.ai.maxResponses) {
    ctx.reply(getRandomResponse(settings.farewellMessages), {
      reply_to_message_id: ctx.message.message_id
    });
    userSessions.delete(key);
    return true;
  }
  return false;
}

async function generateAIResponse(key, message, ctx) {
  if (checkResponseLimit(key, ctx)) return null;

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

    const session = userSessions.get(key);
    session.aiResponseCount++;
    session.lastActivity = Date.now();
    userSessions.set(key, session);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return getRandomResponse([
      "Голова разболелась 🤒",
      "Чёт я торможу. Погоди…",
      "Блин. Я, кажется, телефон разбил 😳"
    ]);
  }
}

// Главный обработчик сообщений
bot.on('message', async (ctx) => {
  if (handlePrivateChat(ctx)) return;

  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const key = `${chatId}:${userId}`;
  const message = ctx.message.text?.toLowerCase() || '';
  const session = userSessions.get(key) || { 
    step: 0, 
    inAIMode: false,
    aiResponseCount: 0,
    lastActivity: Date.now()
  };
  const replyOpt = { reply_to_message_id: ctx.message.message_id };

  // Обновляем время активности
  session.lastActivity = Date.now();

  // Проверка ключевых слов только вне активного диалога
  if (!session.inAIMode && !isReplyToBot(ctx)) {
    const keyword = Object.keys(settings.keywords)
      .find(k => message.includes(k));
    
    if (keyword) {
      await ctx.reply(getRandomResponse(settings.keywords[keyword]), replyOpt);
      userSessions.set(key, { 
        step: 1, 
        inAIMode: false,
        aiResponseCount: 0,
        lastActivity: Date.now()
      });
      return;
    }
  }

  // Обработка диалога
  if (isReplyToBot(ctx)) {
    if (session.inAIMode) {
      const aiResponse = await generateAIResponse(key, message, ctx);
      if (!aiResponse) return;
      await ctx.reply(aiResponse, replyOpt);
      return;
    }

    switch(session.step) {
      case 1:
        await ctx.reply(getRandomResponse(settings.dialogResponses.step1), replyOpt);
        userSessions.set(key, { 
          ...session, 
          step: 2,
          lastActivity: Date.now()
        });
        break;

      case 2:
        await ctx.reply(getRandomResponse(settings.dialogResponses.step2), replyOpt);
        userSessions.set(key, { 
          step: 3, 
          inAIMode: true,
          aiResponseCount: 0,
          lastActivity: Date.now()
        });
        break;

      default:
        await ctx.reply(getRandomResponse([
          "Вот прям извини, малыш 😔 немного не до тебя сейчас. Позже договорим, если не забудем. Чмокаю тебя в попку 💋",
          "Ой. Да погоди ты. Я же уже писал - в Рзн приехал мой бывший, достал звонками сука. Потом продолжим с тобой беседу, если что."
        ]), replyOpt);
    }
  }
});

// Обработчик команды /start
bot.command('start', (ctx) => {
  if (handlePrivateChat(ctx)) return;
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  userSessions.delete(`${chatId}:${userId}`);
  ctx.reply('Подпишись на «ГЕЙ-РЯЗАНЬ». Пообщаемся в чате.', {
    reply_to_message_id: ctx.message.message_id
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});
