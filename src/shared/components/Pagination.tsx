import type { Dispatch, RefObject, SetStateAction } from "react";

type Props = {
  filteredLength: number;
  totalLength: number;
  itemLabel: string;
  page: number;
  pageInputRef: RefObject<HTMLInputElement | null>;
  setPage: Dispatch<SetStateAction<number>>;
};
export function Pagination({
  filteredLength,
  totalLength,
  itemLabel,
  page,
  pageInputRef,
  setPage,
}: Props) {
  return (
    <div className="pagination">
      Showing {filteredLength} of {totalLength} {itemLabel}{" "}
      <span className="pagination-controls">
        Rows per page: <b>10</b> · Page {page} / 1 · Go to{" "}
        <input
          ref={pageInputRef}
          defaultValue="1"
          aria-label="Go to page"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const nextPage = Number(pageInputRef.current?.value);
              if (nextPage === 1) setPage(nextPage);
            }
          }}
        />
      </span>
    </div>
  );
}
