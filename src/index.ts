import puppeteer, { type Browser } from '@cloudflare/puppeteer';
import { Hono } from 'hono';

type Bindings = {
  MYBROWSER: Fetcher;
  LOGIN_ID: string;
  LOGIN_PASSWORD: string;
  TUNAG_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

async function createDraft(env: Bindings) {
  console.log('env ', env);
  console.log('start create draft');
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch(env.MYBROWSER);
    const page = await browser.newPage();
    await page.goto(env.TUNAG_URL);

    await page.locator('#user_login_id').fill(env.LOGIN_ID);
    await page.locator('#new_user > div > div.login__scene.js-scene1 > div.column-buttons.m-t30 > input').click();

    await page.locator('#user_password').fill(env.LOGIN_PASSWORD);
    await page
      .locator('#new_user > div > div.login__scene.js-scene2.animated.fadeInRight > div.column-buttons.m-t30 > input')
      .click();

    console.log('login succeeded');

    const nowDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    await page.locator('#report_item_date_8307194').fill(nowDate);

    await page.locator('#report_item_textarea_40841900').fill(`***
課題対応`);
    await page.locator('#report_item_textarea_40841901').fill(`***
前回と同じ`);
    await page.locator('#report_item_textarea_40841902').fill('***');

    await page
      .locator('#edit_report_25239289 > div > input.btn.btn--sub.btn--bordered-primary.js-submittable.m-r15')
      .click();

    console.log('create draft succeeded');
  } catch (error) {
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('browser closed');
    }
  }
}

const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  console.log('scheduled start');
  await createDraft(env);
  console.log('scheduled end');
};

export default {
  fetch: app.fetch,
  scheduled,
};
