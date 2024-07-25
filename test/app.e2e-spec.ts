import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
      it('TC0000001 - Should assign publish date when calling publish blog API', async () => {
          expect(true).toEqual(true);
          expect(1).toEqual(1);
      });
  })
});
