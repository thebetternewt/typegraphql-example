import { Resolver, Mutation, Arg } from 'type-graphql';

import { User } from '../../entity/User';
import { redis } from '../../redis';
import { CONFIRM_USER_PREFIX } from '../constants/redisPrefixes';

@Resolver(User)
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(
    @Arg('token')
    token: string
  ): Promise<boolean> {
    // Fetch token from redis
    const userId = await redis.get(CONFIRM_USER_PREFIX + token);

    if (!userId) {
      return false;
    }

    // Update user
    await User.update({ id: parseInt(userId, 10) }, { confirmed: true });

    // Delete token from redis
    await redis.del(CONFIRM_USER_PREFIX + token);

    return true;
  }
}
