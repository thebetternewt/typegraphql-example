import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import Express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createConnection } from 'typeorm';

// import QueryComplexity, {
//   fieldConfigEstimator,
//   simpleEstimator,
// } from 'graphql-query-complexity';

import { redis } from './redis';
import { createSchema } from './modules/utils/createSchema';

const main = async () => {
  await createConnection();

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    // validationRules: [
    //   QueryComplexity({
    //     // The maximum allowed query complexity, queries above this threshold will be rejected
    //     maximumComplexity: 8,
    //     // The query variables. This is needed because the variables are not available
    //     // in the visitor of the graphql-js library
    //     variables: {},
    //     // Optional callback function to retrieve the determined query complexity
    //     // Will be invoked whether the query is rejected or not
    //     // This can be used for logging or to implement rate limiting
    //     onComplete: (complexity: number) => {
    //       console.log('Query Complexity:', complexity);
    //     },
    //     estimators: [
    //       // Using fieldConfigEstimator is mandatory to make it work with type-graphql
    //       fieldConfigEstimator(),
    //       // This will assign each field a complexity of 1 if no other estimator
    //       // returned a value. We can define the default value for fields not explicitly annotated
    //       simpleEstimator({
    //         defaultComplexity: 1,
    //       }),
    //     ],
    //   }) as any,
    // ],
  });

  const app = Express();

  const corsOptions = {
    credentials: true,
    origin: 'http://localhost:3000',
  };

  const RedisStore = connectRedis(session);

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: 'qid',
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

  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.listen(4000, () => {
    console.log(`Server listening on http://localhost:4000/graphql`);
  });
};

main();
