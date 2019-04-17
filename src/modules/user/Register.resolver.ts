import { Resolver, Query, Mutation, Arg, UseMiddleware } from 'type-graphql';
import { User } from '../../entity/User';
import { RegisterInput } from './register/RegisterInput';
import { isAuth } from '../middleware/isAuth';
import { logger } from '../middleware/logger';
import { sendEmail } from '../utils/sendEmail';
import { createConfirmationUrl } from '../utils/createConfirmationUrl';

@Resolver(User)
export class RegisterResolver {
  @UseMiddleware(isAuth, logger)
  @Query(() => String)
  async hello() {
    return 'Hello World!';
  }

  @Mutation(() => User)
  async register(@Arg('data')
  {
    email,
    firstName,
    lastName,
    password,
  }: RegisterInput): Promise<User> {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    }).save();

    await sendEmail(email, await createConfirmationUrl(user.id));

    return user;
  }
}
