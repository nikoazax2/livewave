import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(screenshot);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
