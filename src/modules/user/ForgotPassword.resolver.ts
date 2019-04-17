import { Resolver, Mutation, Arg } from 'type-graphql';
import { v4 } from 'uuid';

import { User } from '../../entity/User';
import { redis } from '../../redis';
import { sendEmail } from '../utils/sendEmail';
import { FORGOT_PASSWORD_PREFIX } from '../constants/redisPrefixes';

@Resolver(User)
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email')
    email: string
  ): Promise<boolean> {
    const user = await User.findOne({ email });

    if (!user) {
      return true;
    }

    const token = v4();

    // Set token in redis
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      60 * 60 * 24
    ); // 1 day expiration

    await sendEmail(
      email,
      `http://localhost:3000/user/change-password/${token}`
    );

    return true;
  }
}
