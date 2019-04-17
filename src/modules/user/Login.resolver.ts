import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { User } from '../../entity/User';
import { compare } from 'bcryptjs';
import { MyContext } from 'src/types/MyContext';

@Resolver(User)
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg('email')
    email: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<User | null> {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return null;
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      return null;
    }

    if (!user.confirmed) {
      return null;
    }

    req.session!.userId = user.id;

    return user;
  }
}
