import { faker } from '@faker-js/faker';
import type { NewUser, NewArticle } from '@api/conduit-api';

/**
 * Generates unique test data so parallel runs never collide.
 * Every user gets a unique username/email via a timestamp + random suffix.
 */

const twoWord = 2;
const fourWord = 4;
const fiveWord = 5;
const fortyWord = 40;

export function makeUser(): NewUser & { password: string } {
  const suffix = `${Date.now()}${faker.string.alphanumeric(fourWord)}`.toLowerCase();
  return {
    username: `qa_${faker.internet
      .username()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()}_${suffix}`.slice(0, fortyWord),
    email: `qa_${suffix}@example.test`,
    password: 'Passw0rd!123',
  };
}

export function makeArticle(): NewArticle {
  return {
    title: `${faker.lorem.sentence(fourWord)} ${faker.string.alphanumeric(fiveWord)}`,
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(twoWord),
    tagList: [faker.word.noun(), faker.word.noun()],
  };
}
