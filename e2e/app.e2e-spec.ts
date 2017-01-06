import { Redux6502Page } from './app.po';

describe('redux6502 App', function() {
  let page: Redux6502Page;

  beforeEach(() => {
    page = new Redux6502Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('6502 Emulator (NG2, TS, Redux)');
  });
});
