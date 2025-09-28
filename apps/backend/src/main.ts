import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"

const cookieParser = require('cookie-parser')
async function start() {
  const PORT = process.env.BACKEND_PORT || 3001
  console.log(PORT);
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Freex docs")
    .setDescription("Freex documentation")
    .setVersion("0.1.5")
    .addTag("Freex")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)
  app.use(cookieParser(process.env.COOKIE_SECRET))
  app.enableCors({
    credentials: true,
    origin: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(8081, () => '0.0.0.0')
}

start()