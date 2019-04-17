import faker from 'faker';
import { Connection } from 'typeorm';
import { testConn } from '../../../test-utils/testConn';
import { gCall } from '../../../test-utils/gCall';
import { User } from '../../../entity/User';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});

afterAll(async () => {
  await conn.close();
});

const meQuery = `
  query Me {
    me {
      id
      firstName
      lastName
      name
      email
    }
  }
`;

describe('Me', () => {
  it('get user', async () => {
    const user = await User.create({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(10),
    }).save();

    const response = await gCall({
      source: meQuery,
      userId: user.id,
    });

    console.log(response);
    expect(response).toMatchObject({
      data: {
        me: {
          id: `${user.id}`,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      },
    });
  });

  it('returns null', async () => {
    const response = await gCall({
      source: meQuery,
    });

    console.log(response);
    expect(response).toMatchObject({
      data: {
        me: null,
      },
    });
  });
});
