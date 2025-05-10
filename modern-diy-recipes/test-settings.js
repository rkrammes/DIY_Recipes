/**
 * Test script for Settings module
 * This script verifies that the settings module is working correctly
 * Run with: node test-settings.js
 */

const puppeteer = require('puppeteer');

async function testSettings() {
  console.log('Starting Settings module test...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Take a screenshot of the homepage
    console.log('Taking homepage screenshot...');
    await page.screenshot({ path: 'homepage-screenshot.png' });
    
    // Look for settings link and click it
    console.log('Looking for Settings link...');
    const settingsLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const settings = links.find(link => 
        link.textContent.toLowerCase().includes('settings') || 
        link.href.includes('settings')
      );
      return settings ? settings.href : null;
    });
    
    if (settingsLink) {
      console.log(`Found Settings link at: ${settingsLink}`);
      await page.goto(settingsLink, { waitUntil: 'networkidle2' });
      
      // Take a screenshot of the settings page
      console.log('Taking settings page screenshot...');
      await page.screenshot({ path: 'settings-screenshot.png' });
      
      // Check if the theme settings are present
      const themeSettingsExists = await page.evaluate(() => {
        return !!document.querySelector('h2:contains("Visual Theme")') || 
               !!document.querySelector('h2:contains("Theme")');
      });
      
      if (themeSettingsExists) {
        console.log('✅ Theme settings found!');
      } else {
        console.log('❌ Theme settings not found');
      }
      
      // Check if the profile settings are present
      const profileSettingsExists = await page.evaluate(() => {
        return !!document.querySelector('h2:contains("User Profile")') || 
               !!document.querySelector('h2:contains("Profile")');
      });
      
      if (profileSettingsExists) {
        console.log('✅ Profile settings found!');
      } else {
        console.log('❌ Profile settings not found');
      }
      
      console.log('Settings test completed successfully!');
    } else {
      console.log('❌ Settings link not found on homepage');
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testSettings().catch(console.error);