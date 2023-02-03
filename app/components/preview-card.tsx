/* eslint-disable @next/next/no-img-element */
import React from "react";
import type { LinkPreviewCardData } from "../lib/link-preview-types";

// Credits: taken directly from innos.io
export const PreviewCard = React.forwardRef(function PreviewCard(
  { data }: { data: LinkPreviewCardData },
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  console.log(data)
  return (
    <a
      className="block cursor-pointer select-none rounded-md border border-gray-200 overflow-hidden max-w-[90vw] hover:border-blue-200 shadow-sm"
      href={data.url}
      ref={ref}
      rel="noopener noreferrer"
      target="_blank"
      style={{ width: data.width, height: data.height }}
    >
      <span className="h-full bg-gray-50 flex justify-between items-stretch">
        <span className="py-3 px-4 flex-[2] overflow-hidden flex-col flex">
          <span className="text-base text-gray-800 font-medium leading-6 text-ellipsis whitespace-nowrap shrink-0">
            {data.title}
          </span>
          <span className="leading-5 text-xs font-normal text-gray-500 mt-1.5 flex flex-grow overflow-auto">
            {data.description}
          </span>
          <span className="flex items-center flex-nowrap min-w-0 flex-row h-4 leading-4 text-xs text-gray-700 mt-1.5">
            {data.favicons && data.favicons?.length > 0 && (
              <img
                className="mr-2"
                src={data?.favicons[0]}
                width={16}
                height={16}
                alt=""
              />
            )}
            <span className="grow-0 shrink min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {data.url}
            </span>
          </span>
        </span>
        {data.images?.[0] && (
          <span className="flex-1">
            <img
              className="object-cover overflow-hidden h-full float-right"
              src={data.images[0]}
              alt=""
            />
          </span>
        )}
      </span>
    </a>
  );
});
