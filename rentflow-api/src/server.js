import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function bootstrap() {
    await connectDatabase();

    app.listen(env.PORT, () => {
        console.log("");
        console.log("==================================");
        console.log("🚀 RentFlow API Started");
        console.log(`🌐 Port : ${env.PORT}`);
        console.log(`🌿 Environment : ${env.NODE_ENV}`);
        console.log("==================================");
        console.log("");
    });
}

bootstrap();