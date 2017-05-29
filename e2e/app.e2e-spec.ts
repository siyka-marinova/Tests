import { GridTestPage } from './app.po';

describe('my-first-angular2-project App', () => {
  let page: GridTestPage;

  beforeEach(() => {
    page = new GridTestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
