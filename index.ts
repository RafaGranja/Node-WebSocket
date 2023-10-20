//index.js
const app = require("./src/app");
const appWs = require("./src/app-ws");

const server = app.listen(process.env.PORT || 8081, () => {
  console.log(`App Express is running!`);
});

appWs(server);
