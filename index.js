// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
import { chromium } from 'playwright';
import { test, expect } from '@playwright/test';

test('Posts should be sorted from newest to oldest', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/newest');

  const dates = await page.locator('span.age a').allTextContents();
  const isSorted = isSortedNewestToOldest(dates);

  expect(isSorted).toBe(true); // Assertion will fail the test if false
});


async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto('https://news.ycombinator.com/newest');

  const allPosts = [];

  while (allPosts.length < 100) {
    // Wait for rows to load
    const outerTable = page.locator('#hnmain');
    const innerTable = outerTable.locator('table').nth(1);
    const rowLocator = innerTable.locator('tbody > tr:not([class])');
    const rowCount = await rowLocator.count();


    let lastVal = 0;
    for (let i = 0; i < rowCount - 1; i++) {
      const row = rowLocator.nth(i);
      // const cells = await row.locator('td').allTextContents();
      // console.log(cells);

      const minutes = await row.locator('td.subtext span.subline span.age a').textContent();
      console.log(minutes);
      const trueVal = parseRelativeTime(minutes);

      if (i == 0) {
        lastVal = trueVal;
      }

      else {
        if (trueVal < lastVal) {
          await browser.close();
          return false;
        }
        lastVal = trueVal;
      }

      console.log(trueVal);
      allPosts.push(trueVal);
      console.log(allPosts.length + '\n');

      if (allPosts.length >= 100) break;
    }

    // If we still need more posts, try to click "More"
    if (allPosts.length < 100) {
      const moreButton = page.locator('text=More');

      if (await moreButton.isVisible()) {
        await Promise.all([
          page.waitForURL('**/newest?next=*&n=*'),
          moreButton.click(),
        ]);
      } else {
        break; // no more pages/posts
      }
    }

  }
  await browser.close();
  return true;




}

function parseRelativeTime(text) {
  if (/just now/i.test(text)) return 0;

  if (/few seconds/i.test(text)) return 5;

  const match = text?.match(/(\d+)\s+(second|minute|hour|day|year)s?\s+ago/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    year: 31536000,
  };

  return value * (multipliers[unit] || 0);
}


(async () => {
  const sorted = await sortHackerNewsArticles();
  if (!sorted) {
    throw new Error('❌ Posts are NOT sorted from newest to oldest!');
  } else {
    console.log('✅ Posts are sorted correctly from newest to oldest.');
  }


})();
