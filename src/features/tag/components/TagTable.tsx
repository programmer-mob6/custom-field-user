import { Link2 } from "lucide-react";
import type { TagRow } from "../types/tag.types";
import { TagTypeIcon } from "./TagTypeIcon";
import { TagSourceBadge } from "./TagSourceBadge";
import { TagStatusBadge } from "./TagStatusBadge";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type Props = {
  rows: TagRow[];
  showStatus: boolean;
};

export function TagTable({ rows, showStatus }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TAG Type</th>
            <th>Code</th>
            <th>Device Name</th>
            <th>SKU</th>
            <th>Brand</th>
            <th>Model/Type</th>
            <th>Source</th>
            <th>Type</th>
            {showStatus && <th>TAG Status</th>}
            <th>Last Scanned</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <TagTypeIcon tagType={row.tagType} />
              </td>
              <td>
                {row.code}
                {row.isCombined && (
                  <Link2 size={13} className="link-icon" aria-label="Combined TAG" />
                )}
              </td>
              <td>{row.deviceName ?? "—"}</td>
              <td>{row.sku ?? "—"}</td>
              <td>{row.brand ?? "—"}</td>
              <td>{row.modelType ?? "—"}</td>
              <td>
                <TagSourceBadge source={row.source} />
              </td>
              <td>{row.category}</td>
              {showStatus && (
                <td>
                  <TagStatusBadge status={row.status} />
                </td>
              )}
              <td>
                {row.lastScannedAt ? (
                  <>
                    {dateFormatter.format(new Date(row.lastScannedAt))}
                    {row.lastScannedModule && <div className="muted">{row.lastScannedModule}</div>}
                  </>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
