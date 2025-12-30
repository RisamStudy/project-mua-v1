import puppeteer from 'puppeteer';

export const getPuppeteerConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
  }
  
  // Production config
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  };
};

export const launchBrowser = async () => {
  const config = getPuppeteerConfig();
  return await puppeteer.launch(config);
};