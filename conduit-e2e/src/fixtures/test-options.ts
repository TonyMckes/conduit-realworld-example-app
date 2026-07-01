import { test as base } from '@playwright/test';
import { ConduitApi, type User } from '@api/conduit-api';
import { makeUser } from '@data/user.factory';

type Fixtures = {
  /** Typed API client bound to the current request context. */
  api: ConduitApi;
  /** A freshly registered user, created via the API before the test runs. */
  registeredUser: User & { password: string };
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ConduitApi(request));
  },

  registeredUser: async ({ api }, use) => {
    const creds = makeUser();
    const user = await api.register(creds);
    await use({ ...user, password: creds.password });
    // Teardown could go here (e.g. delete the user) if the API supported it.
  },
});

export { expect } from '@playwright/test';
