// @ts-check
import { test, expect } from '@playwright/test';


test('sorted newest to oldest', async ({ page }) => {

  await page.goto('https://news.ycombinator.com/newest');
  const allPosts = [];
  let prevTime = -1;
  while (allPosts.length < 100) {
    // Use a regular expression to get the time for all posts currently visible
    const dates = await page.getByRole('cell', {
      name: /^\d+ point(?:s)? by [a-zA-Z0-9_.-]+ \d* (second|minute|hour|day|year)s? ago/,
    }).all();



    for (let i = 0; i < dates.length; i++) {
      if (allPosts.length >= 100) break;
      const text = await dates[i].textContent();
      const curTime = parseRelativeTime(text);
      expect(curTime).toBeGreaterThanOrEqual(prevTime);
      allPosts.push(text);



      prevTime = curTime ?? 0;
    }

    if (allPosts.length < 100) {
      const moreButton = page.getByRole('link', {
        name: 'More',
        exact: true,
      });



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

  expect(allPosts.length).toBe(100);
  if (allPosts.length !== 100) {
    console.log(`🚨 Not enough posts found. Posts found ${allPosts.length}`);
  }

  else {
    console.log(`✅ Checked ${allPosts.length} posts sorted from newest to oldest.`);
  }



});






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

