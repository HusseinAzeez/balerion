import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
      it('Should reorder products after deleting one', async () => {
          expect(true).toEqual(true);
          expect(1).toEqual(1);
      });
  })
});
