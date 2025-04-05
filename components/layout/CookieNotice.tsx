"use client";

import { FC, useState } from "react";

export const CookieNotice: FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-black py-3 lg:px-6 lg:py-4"
      role="dialog"
      aria-labelledby="cookie-notice-title"
      aria-describedby="cookie-notice-description"
    >
      <div className="flex h-full flex-col justify-center p-5 lg:flex-row lg:items-center lg:justify-evenly lg:p-4">
        <div className="mb-2 max-w-full lg:mb-0 lg:max-w-[640px]">
          <h2
            id="cookie-notice-title"
            className="mb-4 text-[23px] font-bold leading-7 text-white"
          >
            Did someone say ... cookies?
          </h2>
          <p
            id="cookie-notice-description"
            className="text-[15px] leading-5 text-[#e7e9ea]"
          >
            BaseBuzz uses cookies to provide a better, safer and faster service.
            Some cookies are necessary to use our services, improve our
            services, and make sure they work properly{" "}
            <button
              className="inline text-[15px] leading-5 underline decoration-[#1d9bf0] hover:decoration-[#1d9bf0]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]"
              onClick={() => {
                /* TODO: Implement cookie preferences dialog */
              }}
              aria-label="Show more information about cookie choices"
            >
              More about your choices
            </button>
            .
          </p>
        </div>
        <div className="flex h-full flex-col justify-center gap-4">
          <button
            onClick={() => setIsVisible(false)}
            className="h-[42px] w-full rounded-[10px] bg-[rgb(239,243,244)] text-[17px] font-bold leading-5 text-[#0f1419] transition-colors hover:bg-[rgb(239,243,244)]/90 lg:h-[44px] lg:w-[420px]"
            aria-label="Accept all cookies"
          >
            Accept all cookies
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="h-[42px] w-full rounded-[10px] bg-[rgb(239,243,244)] text-[17px] font-bold leading-5 text-[#0f1419] transition-colors hover:bg-[rgb(239,243,244)]/90 lg:h-[44px] lg:w-[420px]"
            aria-label="Refuse non-essential cookies"
          >
            Refuse non-essential cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
