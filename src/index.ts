import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import Express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createConnection } from 'typeorm';
import cors from 'cors';

import { redis } from './redis';
import { createSchema } from './modules/utils/createSchema';

const main = async () => {
  await createConnection();

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
  });

  const app = Express();

  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:3000',
    })
  );

  const RedisStore = connectRedis(session);

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: 'sid',
      secret: 'as4ppfa2psu&ifh',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
      },
    })
  );

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`Server listening on http://localhost:4000/graphql`);
  });
};

main();
