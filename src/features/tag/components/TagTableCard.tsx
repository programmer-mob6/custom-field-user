import type { Dispatch, RefObject, SetStateAction } from "react";
import { Pagination } from "../../../shared/components/Pagination";
import type { TagRow } from "../types/tag.types";
import { TagTable } from "./TagTable";

type Props = {
  rows: TagRow[];
  totalLength: number;
  showStatus: boolean;
  page: number;
  pageInputRef: RefObject<HTMLInputElement | null>;
  setPage: Dispatch<SetStateAction<number>>;
};

export function TagTableCard({
  rows,
  totalLength,
  showStatus,
  page,
  pageInputRef,
  setPage,
}: Props) {
  return (
    <div className="table-card">
      {rows.length ? (
        <TagTable rows={rows} showStatus={showStatus} />
      ) : (
        <div className="empty">
          <span>◫</span>
          <h3>{totalLength ? "No results found" : "No TAGs registered yet"}</h3>
          <p>Try adjusting your filters or search.</p>
        </div>
      )}
      <Pagination
        filteredLength={rows.length}
        totalLength={totalLength}
        itemLabel="TAGs"
        page={page}
        pageInputRef={pageInputRef}
        setPage={setPage}
      />
    </div>
  );
}
