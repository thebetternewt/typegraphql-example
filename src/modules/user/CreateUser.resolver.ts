import {
  Resolver,
  Mutation,
  Arg,
  ClassType,
  InputType,
  Field,
  Float,
  Query,
  UseMiddleware,
} from 'type-graphql';
import { User } from '../../entity/User';
import { RegisterInput } from './register/RegisterInput';
import { Product } from '../../entity/Product';
import { Middleware } from 'type-graphql/dist/interfaces/Middleware';

function createResolver<T extends ClassType, U extends ClassType>(
  suffix: string,
  returnType: T,
  inputType: U,
  entity: any,
  middleware: Middleware<any>[] = []
) {
  @Resolver()
  class BaseResolver {
    @Mutation(() => returnType, { name: `create${suffix}` })
    @UseMiddleware(...middleware)
    async create(@Arg('data', () => inputType) data: any): Promise<T> {
      return entity.create(data).save();
    }
  }

  return BaseResolver;
}

@InputType()
class ProductInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;
}

const BaseCreateUser = createResolver('User', User, RegisterInput, User);
const BaseCreateProduct = createResolver(
  'Product',
  Product,
  ProductInput,
  Product
);

@Resolver()
export class CreateUserResolver extends BaseCreateUser {
  // @Mutation(() => User)
  // async createUser(@Arg('data') data: RegisterInput) {
  //   return User.create(data).save();
  // }
}

@Resolver()
export class CreateProductResolver extends BaseCreateProduct {
  @Query(() => [Product])
  async getProducts(): Promise<Product[]> {
    return Product.find();
  }
}
