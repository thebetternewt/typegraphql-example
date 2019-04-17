import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';

import { User } from '../../entity/User';
import { redis } from '../../redis';
import { FORGOT_PASSWORD_PREFIX } from '../constants/redisPrefixes';
import { ChangePasswordInput } from './changePassword/ChangePasswordInput';
import { MyContext } from 'src/types/MyContext';

@Resolver(User)
export class ChangePasswordResolver {
  @Mutation(() => User, { nullable: true })
  async changePassword(
    @Arg('data')
    { token, password }: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    // Fetch token from redis
    const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);

    if (!userId) {
      return null;
    }

    const user = await User.findOne(userId);

    if (!user) {
      return null;
    }

    // Delete token from redis
    await redis.del(FORGOT_PASSWORD_PREFIX + token);

    user.password = password;

    await user.save();

    // Automatically log user in after successful password change
    ctx.req.session!.userId = user.id;

    return user;
  }
}
