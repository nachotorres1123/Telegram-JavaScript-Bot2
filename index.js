const { Bot, GrammyError, HttpError } = require("grammy");
const { autoQuote } = require("@roziscoding/grammy-autoquote");
const fs = require("fs");
const path = require("path");
const { Configuration, OpenAIApi } = require("openai"); // Importa la biblioteca de OpenAI

if (fs.existsSync(".env")) {
  require("dotenv").config();
}

const botToken = process.env.BOT_TOKEN;
const openaiApiKey = "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 "; // Reemplaza con tu clave de API de OpenAI

if (!botToken) {
  throw new Error("BOT_TOKEN is not set in environment variables! Exiting...");
}

const openaiConfiguration = new Configuration({
    apiKey: openaiApiKey,
});

const openai = new OpenAIApi(openaiConfiguration);

async function start() {
  const bot = new Bot(botToken);
  bot.use(autoQuote);

  const commandFilesDir = path.resolve(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandFilesDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandFilesDir, file));
    bot.command(command.name, async (ctx) => {
      await command.handler(ctx, openai); // Pasa la instancia de OpenAI a los manejadores de comandos
    });

    if (command.alias) {
      for (const alias of command.alias) {
        bot.command(alias, async (ctx) => {
          await command.handler(ctx, openai); // Pasa la instancia de OpenAI a los manejadores de comandos
        });
      }
    }
  }

  bot.command("start", (ctx) =>
    ctx.reply("Hello!\n\n" + "Run the /help command to see what I can do!")
  );

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  process.on("uncaughtException", (err) => {
    console.error(err);
  });

  process.on("unhandledRejection", (err) => {
    console.error(err);
  });

  process.on("SIGINT", () => {
    console.log("Stopping...");
    bot.stop();
    process.exit(0);
  });

  console.log("Starting the bot...");
  await bot.start();
}

start().catch((error) => {
  console.error("Error occurred during bot startup:", error);
  process.exit(1);
});
