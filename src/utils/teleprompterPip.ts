/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility for OS-level Picture-in-Picture (Always on top even when browser is minimized).
 * Supports both:
 * 1. Document Picture-in-Picture API (Chrome 116+, Edge)
 * 2. Canvas-to-Video Picture-in-Picture fallback (Safari, Firefox, Mobile Chrome, etc.)
 */

export interface PipController {
  close: () => void;
  isActive: boolean;
}

/**
 * Checks if the current execution context is the top-level window.
 * Browsers forbid documentPictureInPicture.requestWindow from within an iframe.
 */
export function isTopLevelContext(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self === window.top;
  } catch {
    // Accessing window.top from a cross-origin iframe throws SecurityError
    return false;
  }
}

export function isDocumentPipSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // If in an iframe (e.g. AI Studio preview), Document PiP is blocked by browser policy
  if (!isTopLevelContext()) {
    return false;
  }
  return 'documentPictureInPicture' in window && typeof (window as any).documentPictureInPicture?.requestWindow === 'function';
}

export function isVideoPipSupported(): boolean {
  return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
}

/**
 * Opens a Document Picture-in-Picture window containing the element.
 * Safely handles iframe constraints and returns null instead of throwing uncaught errors.
 */
export async function openDocumentPip(
  contentElement: HTMLElement,
  options: { width?: number; height?: number; title?: string; onClosed?: () => void }
): Promise<Window | null> {
  if (!isDocumentPipSupported()) {
    return null;
  }

  try {
    // @ts-ignore
    const pipWindow: Window = await window.documentPictureInPicture.requestWindow({
      width: options.width || 360,
      height: options.height || 420,
    });

    if (!pipWindow || !pipWindow.document) {
      return null;
    }

    // Copy all style elements and stylesheets
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
        const style = pipWindow.document.createElement('style');
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch {
        if (styleSheet.href) {
          const link = pipWindow.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      }
    });

    pipWindow.document.body.style.margin = '0';
    pipWindow.document.body.style.padding = '0';
    pipWindow.document.body.style.overflow = 'hidden';
    pipWindow.document.body.style.backgroundColor = '#000000';
    pipWindow.document.title = options.title || 'Manuskrip Teleprompter';

    pipWindow.document.body.appendChild(contentElement);

    if (options.onClosed) {
      pipWindow.addEventListener('pagehide', () => {
        options.onClosed?.();
      });
    }

    return pipWindow;
  } catch (err: any) {
    console.warn('Document PiP request was not allowed or closed in current context:', err?.message || err);
    return null;
  }
}
