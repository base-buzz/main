"use client";

interface ShowPostsCountProps {
  count: number;
}

export function ShowPostsCount({ count }: ShowPostsCountProps) {
  return (
    <div className="cursor-pointer border-b border-t border-[#eff3f4] bg-white transition-colors hover:bg-[#f7f9f9]">
      <div className="flex items-center justify-center py-3">
        <span className="text-[15px] font-normal text-[#1d9bf0] hover:underline">
          Show {count} posts
        </span>
      </div>
    </div>
  );
}
