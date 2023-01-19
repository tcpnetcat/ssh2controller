//

process.on('uncaughtException', function(er) {
  console.log(er)
});
process.on('unhandledRejection', function(er) {
  console.log(er)
});
const fs = require(`fs`);
const config = require("./config.json");
const {
  Client
} = require('ssh2');

const {
  Telegraf
} = require('telegraf');

const bot = new Telegraf(config.bot.token);
var msg = ``;

function result(server, data) {
  msg += `${server} -> ${data}\n\n`;
  console.log(msg);
};

const servers = fs.readFileSync(config.servers, 'utf-8').toString().match(/\S+/g);

async function sendData(command, ctx) {
  var promise = new Promise(function(resolve, reject) {

    for (let i = 0; i < servers.length; i++) {

      console.log(servers[i]);

      const conn = new Client();
      conn.on('ready', async () => {
        await conn.exec(`${command}`, async (err, stream) => {
          if (err) {
            console.log(`#[${i+1}/${servers.length}] ${servers[i]} -> ${data}\n\n`);
          }
          stream.on('close', (code, signal) => {
            conn.end();
          }).on('data', async (data) => {
            console.log(`#[${i+1}/${servers.length}] ${servers[i]} -> ${data}\n\n`);
          }).stderr.on('data', async (data) => {
            console.log(`#[${i+1}/${servers.length}] ${servers[i]} -> ${data}\n\n`);
          });

          if (i == (servers.length - 1)) resolve(`111`);

        });
      }).connect({
        host: servers[i],
        port: 22,
        username: `${config.user}`,
        password: `${config.password}`
      })


    };

  });

  return promise;
};

bot.on("message", async ctx => {
  if (!ctx.message.text)
    return;

  if (!config.ownerId.includes(ctx.message.from.username))
    return ctx.reply(`go away bitch`);

  sendData(ctx.message.text, ctx);
  ctx.reply("```" + ctx.message.text + "```\n\n" + `${msg}`, {
    parse_mode: 'MarkdownV2'
  });

});

bot.telegram.getMe().then((bot_informations) => {
  console.log(`Turn on ${bot_informations.username}`);
});

// | Do this $hit
bot.launch();