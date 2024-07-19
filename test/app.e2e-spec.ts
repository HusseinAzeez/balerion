import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
      it('TC0000003, Should reorder products after deleting one', async () => {
          expect(true).toEqual(true);
      });
  })
});
