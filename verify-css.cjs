const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:5173");
  await page.evaluate(() => {
    localStorage.setItem("te_token", "mock-token-u-1");
    localStorage.setItem("te_user", JSON.stringify({ id: "u-1", username: "Administrator", name: "系统管理员" }));
    localStorage.setItem("te_permissions", JSON.stringify(["*"]));
  });

  // Check report page
  await page.goto("http://localhost:5173/api-test/report", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check if bg-bar styles are applied
  const reportStyles = await page.evaluate(() => {
    const bgBar = document.querySelector('.bg-bar');
    const bgCard = document.querySelector('.bg-card');
    const bgBtn = document.querySelector('.bg-btn-pri');
    const bgPill = document.querySelector('.bg-pill');

    const results = {
      bgBarExists: !!bgBar,
      bgBarStyles: bgBar ? {
        display: getComputedStyle(bgBar).display,
        gap: getComputedStyle(bgBar).gap,
        padding: getComputedStyle(bgBar).padding,
      } : null,
      bgCardExists: !!bgCard,
      bgCardStyles: bgCard ? {
        border: getComputedStyle(bgCard).border,
        borderRadius: getComputedStyle(bgCard).borderRadius,
      } : null,
      bgBtnStyles: bgBtn ? {
        background: getComputedStyle(bgBtn).background,
        color: getComputedStyle(bgBtn).color,
      } : null,
      bgPillStyles: bgPill ? {
        display: getComputedStyle(bgPill).display,
        borderRadius: getComputedStyle(bgPill).borderRadius,
      } : null,
      // Check which stylesheets are loaded
      styleCount: document.styleSheets.length,
    };
    return results;
  });
  console.log("Report styles:", JSON.stringify(reportStyles, null, 2));

  // Check debug page
  await page.goto("http://localhost:5173/api-test/debug", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const debugStyles = await page.evaluate(() => {
    const atDbg = document.querySelector('.at-dbg');
    const bgSel = document.querySelector('.at-reqline .bg-sel');
    const bgIn = document.querySelector('.at-reqline .bg-in');
    const atSeg = document.querySelector('.at-seg button.on');

    return {
      atDbgStyles: atDbg ? {
        display: getComputedStyle(atDbg).display,
        flexDirection: getComputedStyle(atDbg).flexDirection,
      } : null,
      bgSelStyles: bgSel ? {
        height: getComputedStyle(bgSel).height,
        border: getComputedStyle(bgSel).border,
      } : null,
      bgInStyles: bgIn ? {
        height: getComputedStyle(bgIn).height,
        flex: getComputedStyle(bgIn).flex,
      } : null,
      atSegStyles: atSeg ? {
        borderBottom: getComputedStyle(atSeg).borderBottom,
        color: getComputedStyle(atSeg).color,
      } : null,
    };
  });
  console.log("Debug styles:", JSON.stringify(debugStyles, null, 2));

  await browser.close();
})();
