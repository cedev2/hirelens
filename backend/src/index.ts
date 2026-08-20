import { app } from "./server";
import ENV from "./config/env";

app.listen(ENV.port, () => {
  console.log("Server is running on Port", ENV.port);
});
