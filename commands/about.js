// commands/about.js

module.exports = {
  name: "about",
  handler: async (ctx) => {
    await ctx.reply("This is a bot created by [@NtEasyMoney]. It can do amazing things!");
  }
};
