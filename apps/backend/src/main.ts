import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"

const cookieParser = require('cookie-parser')
async function start() {
    const PORT = process.env.BACKEND_PORT || 3001
    console.log(PORT);
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    app.setGlobalPrefix('backend');

    app.useGlobalPipes(new ValidationPipe());

    app.useStaticAssets('/images', {
        prefix: '/backend/images/',
    });

    const config = new DocumentBuilder()
        .setTitle("Freex docs")
        .setDescription("Freex documentation")
        .setVersion("0.1.5")
        .addTag("Freex")
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('/backend/docs', app, document)
    app.use(cookieParser(process.env.COOKIE_SECRET))
    app.enableCors({
        credentials: true,
        origin: true,
    });

    await app.listen(8081, () => '0.0.0.0')
}

start()