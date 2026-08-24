import dns from "dns";
import { app } from "./server";
import ENV from "./config/env";

// Render (and most PaaS hosts) have no IPv6 egress; prefer IPv4 so SMTP
// connections to smtp.gmail.com don't fail with ENETUNREACH on AAAA results.
dns.setDefaultResultOrder("ipv4first");

app.listen(ENV.port, () => {
  console.log("Server is running on Port", ENV.port);
});
