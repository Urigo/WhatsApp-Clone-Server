const Koa = require('koa');
const app = module.exports = new Koa();

app.use(async function(ctx: any) {
  ctx.body = 'Hello world';
});

if (!module.parent) app.listen(3000);

