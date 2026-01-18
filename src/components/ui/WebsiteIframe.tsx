import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ExternalLink,
  AlertTriangle,
  Globe,
  RefreshCw,
  Eye,
  Shield,
  Camera,
  ImageOff
} from 'lucide-react';
import { isDomainLikelyBlocked, getRecommendedProxy, PROXY_SERVICES } from '@/utils/websiteEmbedChecker';
import { getScreenshotUrl, getFallbackScreenshotUrl } from '@/utils/screenshotService';

interface WebsiteIframeProps {
  src: string;
  title?: string;
  className?: string;
  fallbackMessage?: string;
  showFallbackOptions?: boolean;
  onLoadError?: () => void;
  onLoadSuccess?: () => void;
}

const WebsiteIframe: React.FC<WebsiteIframeProps> = ({
  src,
  title = "Website Preview",
  className = "w-full h-full border-none",
  fallbackMessage,
  showFallbackOptions = true,
  onLoadError,
  onLoadSuccess
}) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [autoRetryInProgress, setAutoRetryInProgress] = useState(false);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);
  const [showRetryProcess, setShowRetryProcess] = useState(false);

  // Screenshot fallback states
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const [useFallbackScreenshot, setUseFallbackScreenshot] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autoRetryTimeoutRef = useRef<NodeJS.Timeout>();

  // Clean and validate URL
  const cleanUrl = (url: string): string => {
    if (!url) return '';

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if domain is likely blocked and prepare proxy services
  const isLikelyBlocked = isDomainLikelyBlocked(src);
  const proxyServices = [
    cleanUrl(src), // Direct first
    ...PROXY_SERVICES.map(service => service.url(cleanUrl(src)))
  ];

  const finalSrc = useProxy && retryCount > 0
    ? proxyServices[Math.min(retryCount, proxyServices.length - 1)]
    : cleanUrl(src);

  // Load screenshot when iframe fails
  const loadScreenshot = () => {
    console.log('Loading screenshot fallback for:', cleanUrl(src));
    setScreenshotLoading(true);
    setShowScreenshot(true);

    const primaryUrl = getScreenshotUrl(cleanUrl(src));
    setScreenshotUrl(primaryUrl);

    // Preload the image to check if it works
    const img = new Image();
    img.onload = () => {
      console.log('✓ Screenshot loaded successfully from Microlink');
      setScreenshotLoading(false);
      setScreenshotError(false);
    };
    img.onerror = () => {
      console.warn('Microlink screenshot failed, trying Thum.io fallback...');
      // Try fallback
      const fallbackUrl = getFallbackScreenshotUrl(cleanUrl(src));
      setScreenshotUrl(fallbackUrl);
      setUseFallbackScreenshot(true);

      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        console.log('✓ Screenshot loaded successfully from Thum.io');
        setScreenshotLoading(false);
        setScreenshotError(false);
      };
      fallbackImg.onerror = () => {
        console.error('Both screenshot services failed');
        setScreenshotLoading(false);
        setScreenshotError(true);
      };
      fallbackImg.src = fallbackUrl;
    };
    img.src = primaryUrl;
  };

  useEffect(() => {
    setLoadError(false);
    setIsLoading(true);
    setRetryCount(0);
    setHasAutoRetried(false);
    setAutoRetryInProgress(false);
    setShowRetryProcess(false);
    setShowScreenshot(false);
    setScreenshotUrl(null);
    setScreenshotError(false);
    setUseFallbackScreenshot(false);

    // If domain is likely blocked, show warning but still try
    if (isLikelyBlocked) {
      console.warn('Domain is likely to block embedding:', cleanUrl(src));
    }

    // Set a timeout to detect if iframe fails to load
    // Shorter timeout for known blocked domains to trigger auto-retry faster
    const timeout = isLikelyBlocked ? 2000 : 4000; // Faster timeouts for seamless experience
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn('Iframe load timeout, silently trying proxy...');
        handleLoadError();
      }
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (autoRetryTimeoutRef.current) {
        clearTimeout(autoRetryTimeoutRef.current);
      }
    };
  }, [src, useProxy, isLikelyBlocked]);

  const handleLoadError = () => {
    console.error('Iframe failed to load:', finalSrc);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-retry with proxy if we haven't tried yet and it's not already a proxy URL
    if (!hasAutoRetried && !useProxy && retryCount === 0) {
      console.log('Auto-retrying with proxy service silently...');
      setAutoRetryInProgress(true);
      setHasAutoRetried(true);

      // Immediately try proxy without showing the retry process to user
      autoRetryTimeoutRef.current = setTimeout(() => {
        setRetryCount(1);
        setUseProxy(true);
        setLoadError(false);
        // Keep isLoading true to maintain seamless loading appearance
        setAutoRetryInProgress(false);

        // Force iframe reload with proxy
        if (iframeRef.current) {
          const proxyUrl = proxyServices[Math.min(1, proxyServices.length - 1)];
          console.log('Silently trying proxy URL:', proxyUrl);
          iframeRef.current.src = proxyUrl;
        }
      }, 500); // Shorter delay for seamless experience

      return;
    }

    // If auto-retry failed or we've already tried, try screenshot fallback
    console.log('Iframe and proxy failed, attempting screenshot fallback...');
    setLoadError(true);
    setIsLoading(false);
    setAutoRetryInProgress(false);

    // Automatically load screenshot
    loadScreenshot();

    onLoadError?.();
  };

  const handleLoadSuccess = () => {
    console.log('Iframe onLoad fired:', finalSrc);

    // Clear the timeout since we got a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (autoRetryTimeoutRef.current) {
      clearTimeout(autoRetryTimeoutRef.current);
    }

    // CRITICAL: Check if the iframe content is actually accessible
    // CSP-blocked iframes will fire onLoad but content will be inaccessible
    if (iframeRef.current) {
      try {
        // Try to access the iframe's content - this will throw for blocked content
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;

        // If we can access the document and it has content, it's likely working
        // However, cross-origin iframes will also throw, so we need to be smart
        if (iframeDoc) {
          // If document is accessible but empty/about:blank, it might be blocked
          const hasContent = iframeDoc.body && iframeDoc.body.innerHTML.length > 0;
          if (!hasContent) {
            console.warn('Iframe loaded but appears empty, checking if blocked...');
            // Give it a moment then check again
            setTimeout(() => {
              try {
                const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
                if (doc && doc.body && doc.body.innerHTML.length === 0) {
                  console.error('Iframe is empty after loading, treating as blocked');
                  handleLoadError();
                  return;
                }
              } catch {
                // Cross-origin - assume it's working
              }
            }, 500);
          }
        }
      } catch (accessError) {
        // Cross-origin iframe - we can't access content but this is expected
        // The iframe might be working fine, or it might show an error page
        console.log('Cross-origin iframe detected, using visual/timing heuristics');

        // For known blocked domains, treat cross-origin load as failure
        if (isLikelyBlocked) {
          console.warn('Known blocked domain loaded cross-origin, triggering fallback');
          handleLoadError();
          return;
        }
      }
    }

    // If we got here, assume success
    console.log('Iframe loaded successfully:', finalSrc);
    if (useProxy) {
      console.log('✓ Proxy service worked successfully (hidden from user)');
    }
    setLoadError(false);
    setIsLoading(false);
    setAutoRetryInProgress(false);
    setShowScreenshot(false);
    onLoadSuccess?.();
  };

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setLoadError(false);
    setIsLoading(true);
    setShowScreenshot(false);

    // Try with proxy after first retry
    if (newRetryCount >= 1) {
      setUseProxy(true);
    }

    // Force iframe reload with new source
    if (iframeRef.current) {
      const newSrc = useProxy && newRetryCount > 0
        ? proxyServices[Math.min(newRetryCount, proxyServices.length - 1)]
        : cleanUrl(src);
      iframeRef.current.src = newSrc;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(cleanUrl(src), '_blank', 'noopener,noreferrer');
  };

  // Detect iframe load errors using postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check for iframe security errors
      if (event.data && typeof event.data === 'string') {
        if (event.data.includes('X-Frame-Options') ||
          event.data.includes('frame-ancestors') ||
          event.data.includes('refused to connect')) {
          handleLoadError();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Render screenshot preview when iframe fails
  if (loadError && showScreenshot) {
    return (
      <div className="w-full h-full flex flex-col bg-gray-900 relative overflow-hidden">
        {/* Screenshot container - scrollable for full-page screenshots */}
        <div className="relative w-full h-full overflow-hidden">
          {screenshotLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-20">
              <div className="text-center">
                <Camera className="w-12 h-12 animate-pulse mx-auto mb-3 text-blue-400" />
                <p className="text-sm text-gray-300">Generating preview screenshot...</p>
              </div>
            </div>
          )}

          {screenshotError ? (
            // Fallback error UI when screenshot also fails
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-6">
              <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <ImageOff className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Preview Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {fallbackMessage ||
                        "This website cannot be previewed. It has security policies that prevent embedding and screenshot generation."
                      }
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleOpenInNewTab}
                      className="w-full"
                      variant="default"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-4">
                    <p>Website URL: {cleanUrl(src)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Screenshot preview with overlay
            <>
              <img
                src={screenshotUrl || ''}
                alt={`Screenshot of ${cleanUrl(src)}`}
                className="w-full h-auto min-h-full object-contain object-top"
                onError={() => {
                  if (!useFallbackScreenshot) {
                    // Try fallback
                    const fallbackUrl = getFallbackScreenshotUrl(cleanUrl(src));
                    setScreenshotUrl(fallbackUrl);
                    setUseFallbackScreenshot(true);
                  } else {
                    setScreenshotError(true);
                  }
                }}
              />

              {/* Sticky footer with action buttons */}
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                    <Camera className="w-4 h-4" />
                    <span>Preview Only</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleOpenInNewTab}
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Website
                    </Button>

                    {retryCount < 3 && (
                      <Button
                        onClick={handleRetry}
                        size="lg"
                        variant="outline"
                        className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Embed Again
                      </Button>

                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    {cleanUrl(src)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div >
    );
  }

  // Original error UI (kept as fallback)
  if (loadError && !showScreenshot) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Website Cannot Be Embedded</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {fallbackMessage ||
                  "This website has security policies that prevent it from being displayed in an embedded frame. This is a common security measure."
                }
              </AlertDescription>
            </Alert>

            {showFallbackOptions && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 text-center">
                  You can still access the website using these options:
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleOpenInNewTab}
                    className="w-full"
                    variant="default"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>

                  {retryCount < 3 && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500 text-center mt-4">
                  <p>Website URL: {cleanUrl(src)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Loading website...</p>
            {/* Hide proxy-related messages from user - keep it seamless */}
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={finalSrc}
        className={className}
        title={title}
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox allow-microphone allow-camera"
        allow="microphone; camera; autoplay; encrypted-media; fullscreen"
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        // Additional error detection
        onLoadStart={() => setIsLoading(true)}
      />

      {/* Invisible script to detect X-Frame-Options errors */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('X-Frame-Options') || e.message.includes('frame-ancestors'))) {
                window.parent.postMessage('iframe-blocked', '*');
              }
            });
          `
        }}
      />
    </div>
  );
};

export default WebsiteIframe;