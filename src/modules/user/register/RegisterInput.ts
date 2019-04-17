import { InputType, Field } from 'type-graphql';
import { Length, IsEmail } from 'class-validator';
import { IsEmailAlreadyExist } from './isEmailAlreadyExist';
import { PasswordMixin } from '../../shared/PasswordInput';

@InputType()
export class RegisterInput extends PasswordMixin(class {}) {
  @Field()
  @Length(1, 255)
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: 'Email already in use.' })
  email: string;
}
