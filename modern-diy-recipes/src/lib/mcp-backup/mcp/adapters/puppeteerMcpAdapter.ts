/**
 * Puppeteer MCP Adapter
 * 
 * This adapter provides an interface to the Puppeteer MCP server
 * for browser automation and visual content generation.
 */

import { BaseMcpAdapter, McpConnectionOptions } from '../base';

/**
 * Viewport options for screenshots
 */
export interface ViewportOptions {
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  selector?: string;
  fullPage?: boolean;
  quality?: number;
  type?: 'png' | 'jpeg';
  omitBackground?: boolean;
  encoding?: 'base64' | 'binary';
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Puppeteer MCP Adapter implementation
 */
export class PuppeteerMcpAdapter extends BaseMcpAdapter {
  constructor(options: McpConnectionOptions = {}) {
    super('puppeteer', options);
  }
  
  /**
   * Get the MCP server package name
   */
  protected getServerPackage(): string {
    return '@modelcontextprotocol/server-puppeteer';
  }
  
  /**
   * Navigate to a URL
   */
  public async navigateToUrl(url: string, options: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
  } = {}): Promise<{ success: boolean; title: string }> {
    return this.executeFunction<{ success: boolean; title: string }>(
      'navigate', 
      { 
        url,
        waitUntil: options.waitUntil || 'networkidle0',
        timeout: options.timeout || 30000
      }
    );
  }
  
  /**
   * Set viewport size
   */
  public async setViewport(options: ViewportOptions): Promise<{ success: boolean }> {
    return this.executeFunction<{ success: boolean }>(
      'setViewport', 
      { 
        width: options.width || 1280,
        height: options.height || 800,
        deviceScaleFactor: options.deviceScaleFactor || 1,
        isMobile: options.isMobile || false 
      }
    );
  }
  
  /**
   * Take a screenshot
   */
  public async takeScreenshot(options: ScreenshotOptions = {}): Promise<{ data: string; mimeType: string }> {
    return this.executeFunction<{ data: string; mimeType: string }>(
      'screenshot', 
      { 
        selector: options.selector,
        fullPage: options.fullPage,
        quality: options.quality,
        type: options.type || 'png',
        omitBackground: options.omitBackground,
        encoding: options.encoding || 'base64',
        clip: options.clip
      }
    );
  }
  
  /**
   * Click an element
   */
  public async clickElement(selector: string, options: {
    button?: 'left' | 'right' | 'middle';
    clickCount?: number;
    delay?: number;
  } = {}): Promise<{ success: boolean }> {
    return this.executeFunction<{ success: boolean }>(
      'click', 
      { 
        selector,
        button: options.button || 'left',
        clickCount: options.clickCount || 1,
        delay: options.delay
      }
    );
  }
  
  /**
   * Type into an element
   */
  public async typeText(selector: string, text: string, options: {
    delay?: number;
  } = {}): Promise<{ success: boolean }> {
    return this.executeFunction<{ success: boolean }>(
      'type', 
      { 
        selector,
        text,
        delay: options.delay
      }
    );
  }
  
  /**
   * Extract text content from an element
   */
  public async getTextContent(selector: string): Promise<{ text: string }> {
    return this.executeFunction<{ text: string }>(
      'getText', 
      { selector }
    );
  }
  
  /**
   * Evaluate JavaScript in the browser context
   */
  public async evaluateScript<T = any>(script: string, args: any[] = []): Promise<{ result: T }> {
    return this.executeFunction<{ result: T }>(
      'evaluate', 
      { script, args }
    );
  }
  
  /**
   * Wait for an element to be visible
   */
  public async waitForElement(selector: string, options: {
    visible?: boolean;
    hidden?: boolean;
    timeout?: number;
  } = {}): Promise<{ success: boolean }> {
    return this.executeFunction<{ success: boolean }>(
      'waitForElement', 
      { 
        selector,
        visible: options.visible,
        hidden: options.hidden,
        timeout: options.timeout
      }
    );
  }
  
  /**
   * Capture step-by-step screenshots of a recipe
   */
  public async captureRecipeSteps(recipeUrl: string, stepSelectors: string[]): Promise<{
    steps: { image: string; text: string }[];
  }> {
    // Navigate to the recipe page
    await this.navigateToUrl(recipeUrl);
    
    // Prepare to collect step images and text
    const steps: { image: string; text: string }[] = [];
    
    // For each step, take a screenshot and extract text
    for (let i = 0; i < stepSelectors.length; i++) {
      const selector = stepSelectors[i];
      
      // Wait for the step element to be visible
      await this.waitForElement(selector, { visible: true });
      
      // Scroll element into view
      await this.evaluateScript(`
        document.querySelector("${selector}").scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      `);
      
      // Wait a moment for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Take a screenshot of the step
      const screenshot = await this.takeScreenshot({ selector });
      
      // Extract the text
      const textContent = await this.getTextContent(selector);
      
      // Add to our steps collection
      steps.push({
        image: screenshot.data,
        text: textContent.text
      });
    }
    
    return { steps };
  }
  
  /**
   * Generate a visual preview of a recipe
   */
  public async generateRecipePreview(recipeHtml: string): Promise<{ 
    preview: string;
    thumbnail: string;
  }> {
    // Create a data URL with the recipe HTML
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.5;
            }
            h1, h2, h3 { font-weight: 600; }
            img { max-width: 100%; height: auto; }
            .recipe-header { margin-bottom: 2rem; }
            .ingredients-list { margin-bottom: 2rem; }
            .instructions { margin-bottom: 2rem; }
          </style>
        </head>
        <body>
          ${recipeHtml}
        </body>
      </html>
    `)}`;
    
    // Navigate to the data URL
    await this.navigateToUrl(dataUrl);
    
    // Set a reasonable viewport size
    await this.setViewport({ width: 800, height: 1200 });
    
    // Take a full-page screenshot for the preview
    const previewScreenshot = await this.takeScreenshot({ fullPage: true });
    
    // Take a screenshot of just the top portion for the thumbnail
    const thumbnailScreenshot = await this.takeScreenshot({
      clip: { x: 0, y: 0, width: 800, height: 450 }
    });
    
    return {
      preview: previewScreenshot.data,
      thumbnail: thumbnailScreenshot.data
    };
  }
}

// Export a singleton instance
export const puppeteerMcpAdapter = new PuppeteerMcpAdapter();

export default PuppeteerMcpAdapter;