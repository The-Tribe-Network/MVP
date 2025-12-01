/**
 * Parse user agent string to extract device, browser, and OS information
 * For MVP, uses simple regex-based parsing
 */

export interface ParsedUserAgent {
  deviceName: string;
  browser: string;
  os: string;
  isMobile: boolean;
}

/**
 * Extract device name from user agent
 */
function getDeviceName(userAgent: string): string {
  // Mobile devices
  if (/iPhone/.test(userAgent)) {
    const match = userAgent.match(/iPhone(?:\s+OS\s+([\d_]+))?/);
    if (match) {
      // Try to detect iPhone model if available
      if (/iPhone\s*[1-9][0-9]/.test(userAgent)) {
        const modelMatch = userAgent.match(/iPhone\s*([1-9][0-9])\s*Pro/);
        if (modelMatch) {
          return `iPhone ${modelMatch[1]} Pro`;
        }
        const modelMatch2 = userAgent.match(/iPhone\s*([1-9][0-9])/);
        if (modelMatch2) {
          return `iPhone ${modelMatch2[1]}`;
        }
      }
      return "iPhone";
    }
  }

  if (/iPad/.test(userAgent)) {
    return "iPad";
  }

  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android.*?;\s*([^)]+)\)/);
    if (match) {
      const device = match[1].trim();
      // Clean up device name
      return device.split(" Build")[0] || "Android Device";
    }
    return "Android Device";
  }

  // Desktop devices
  if (/Macintosh/.test(userAgent)) {
    // Try to detect MacBook model
    if (/MacBookPro/.test(userAgent)) {
      return "MacBook Pro";
    }
    if (/MacBookAir/.test(userAgent)) {
      return "MacBook Air";
    }
    if (/MacBook/.test(userAgent)) {
      return "MacBook";
    }
    return "Mac";
  }

  if (/Windows/.test(userAgent)) {
    if (/Windows NT 10.0/.test(userAgent)) {
      return "Windows PC";
    }
    return "Windows Device";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux Device";
  }

  return "Unknown Device";
}

/**
 * Extract browser name from user agent
 */
function getBrowser(userAgent: string): string {
  if (/Edg/i.test(userAgent)) {
    return "Edge";
  }
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
    return "Chrome";
  }
  if (/Firefox/i.test(userAgent)) {
    return "Firefox";
  }
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    return "Safari";
  }
  if (/Opera|OPR/i.test(userAgent)) {
    return "Opera";
  }
  return "Unknown Browser";
}

/**
 * Extract operating system from user agent
 */
function getOS(userAgent: string): string {
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS\s+([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      return `iOS ${version}`;
    }
    return "iOS";
  }

  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android\s+([\d.]+)/);
    if (match) {
      return `Android ${match[1]}`;
    }
    return "Android";
  }

  if (/Macintosh|Mac OS X/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X\s+([\d_]+)/);
    if (match) {
      const version = match[1].replace(/_/g, ".");
      return `macOS ${version}`;
    }
    return "macOS";
  }

  if (/Windows NT 10.0/.test(userAgent)) {
    return "Windows 10/11";
  }
  if (/Windows NT 6.3/.test(userAgent)) {
    return "Windows 8.1";
  }
  if (/Windows NT 6.2/.test(userAgent)) {
    return "Windows 8";
  }
  if (/Windows NT 6.1/.test(userAgent)) {
    return "Windows 7";
  }
  if (/Windows/.test(userAgent)) {
    return "Windows";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return "Unknown OS";
}

/**
 * Check if device is mobile
 */
function isMobile(userAgent: string): boolean {
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
}

/**
 * Parse user agent string into structured device information
 */
export function parseUserAgent(userAgent: string | null | undefined): ParsedUserAgent {
  if (!userAgent) {
    return {
      deviceName: "Unknown Device",
      browser: "Unknown Browser",
      os: "Unknown OS",
      isMobile: false,
    };
  }

  return {
    deviceName: getDeviceName(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
    isMobile: isMobile(userAgent),
  };
}

/**
 * Format device info for display
 * Returns a user-friendly device name string
 */
export function formatDeviceInfo(parsed: ParsedUserAgent): string {
  return parsed.deviceName;
}

/**
 * Format location from IP address (placeholder for future geolocation)
 * For MVP, returns null as location service is not implemented
 */
export function getLocationFromIP(ipAddress: string | null | undefined): string | null {
  // TODO: Implement IP geolocation service integration
  // For MVP, return null
  return null;
}

