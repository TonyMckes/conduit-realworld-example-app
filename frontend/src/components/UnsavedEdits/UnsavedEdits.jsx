import { dateTimeFormatter } from "../../helpers/dateFormatter";
import { diffLines, sameTagList } from "../../helpers/mergeText";

// Unchanged lines shown around a change, the rest is folded
const CONTEXT_LINES = 2;

function foldUnchanged(diff) {
  const isNearChange = (index) =>
    diff
      .slice(Math.max(0, index - CONTEXT_LINES), index + CONTEXT_LINES + 1)
      .some(({ type }) => type !== "same");

  const rows = [];
  diff.forEach((row, index) => {
    const last = rows[rows.length - 1];

    if (row.type !== "same" || isNearChange(index)) rows.push(row);
    else if (last?.type === "folded") last.count++;
    else rows.push({ type: "folded", count: 1 });
  });

  return rows;
}

const diffPrefix = { added: "+", removed: "-", same: " " };

function BodyDiff({ saved, unsaved }) {
  return (
    <pre className="unsaved-edit-diff">
      {foldUnchanged(diffLines(saved, unsaved)).map((row, index) =>
        row.type === "folded" ? (
          <span className="diff-folded" key={index}>
            {`  ⋯ ${row.count} unchanged ${row.count === 1 ? "line" : "lines"}\n`}
          </span>
        ) : (
          <span className={`diff-${row.type}`} key={index}>
            {`${diffPrefix[row.type]} ${row.line}\n`}
          </span>
        ),
      )}
    </pre>
  );
}

function UnsavedEdit({
  applied,
  disabled,
  highlighted,
  onApply,
  onDiscard,
  saved,
  unsavedEdit,
}) {
  // Fields the unsaved edit doesn't have (null) were not changed by it
  const changed = (field) =>
    field === "tagList"
      ? Array.isArray(unsavedEdit.tagList) &&
        !sameTagList(unsavedEdit.tagList, saved.tagList)
      : typeof unsavedEdit[field] === "string" &&
        unsavedEdit[field] !== saved[field];
  const hasChanges = ["title", "description", "body", "tagList"].some(changed);

  return (
    <li className={`card unsaved-edit ${highlighted ? "highlighted" : ""}`}>
      <div className="card-block">
        <p className="card-text">
          <strong>Not saved on {dateTimeFormatter(unsavedEdit.createdAt)}</strong>
          {highlighted && <span className="unsaved-edit-tag">Just now</span>}
          {applied && (
            <span className="unsaved-edit-tag">Added to the editor</span>
          )}
        </p>

        {hasChanges ? (
          <details>
            <summary>Compare with the last saved version</summary>
            {changed("title") && (
              <p className="card-text">
                <strong>Title:</strong> <del>{saved.title}</del>{" "}
                <ins>{unsavedEdit.title}</ins>
              </p>
            )}
            {changed("description") && (
              <p className="card-text">
                <strong>Description:</strong> <del>{saved.description}</del>{" "}
                <ins>{unsavedEdit.description}</ins>
              </p>
            )}
            {changed("tagList") && (
              <p className="card-text">
                <strong>Tags:</strong>{" "}
                <del>{saved.tagList.join(", ") || "none"}</del>{" "}
                <ins>{unsavedEdit.tagList.join(", ") || "none"}</ins>
              </p>
            )}
            {changed("body") && (
              <>
                <p className="card-text">
                  <strong>Body:</strong> lines marked <code>-</code> are only
                  in the last saved version, lines marked <code>+</code> are
                  only in these unsaved changes.
                </p>
                <BodyDiff saved={saved.body} unsaved={unsavedEdit.body} />
              </>
            )}
          </details>
        ) : (
          <p className="card-text">Same as the last saved version.</p>
        )}
      </div>

      <div className="card-footer">
        <button
          className="btn btn-sm btn-outline-primary"
          disabled={disabled}
          onClick={() => onApply("append", unsavedEdit)}
          title="Add the unsaved body and tags after those in the editor"
          type="button"
        >
          Append
        </button>{" "}
        <button
          className="btn btn-sm btn-outline-primary"
          disabled={disabled}
          onClick={() => onApply("merge", unsavedEdit)}
          title="Combine the unsaved changes with the article in the editor"
          type="button"
        >
          Merge
        </button>{" "}
        <button
          className="btn btn-sm btn-outline-primary"
          disabled={disabled}
          onClick={() => onApply("overwrite", unsavedEdit)}
          title="Replace the article in the editor with the unsaved changes"
          type="button"
        >
          Overwrite
        </button>
        <button
          className="btn btn-sm btn-outline-danger pull-xs-right"
          disabled={disabled}
          onClick={() => onDiscard(unsavedEdit)}
          title="Delete these unsaved changes"
          type="button"
        >
          <i className="ion-trash-a"></i> Discard
        </button>
      </div>
    </li>
  );
}

/**
 * Changes that were submitted from another editor window but not saved,
 * because the article had been updated in the meantime. Each of them can be
 * brought into the editor (`onApply(mode, unsavedEdit)` with mode "append",
 * "merge" or "overwrite") or deleted (`onDiscard(unsavedEdit)`).
 */
function UnsavedEdits({
  appliedIds,
  disabled,
  highlightedId,
  onApply,
  onDiscard,
  saved,
  unsavedEdits,
}) {
  if (!saved || !unsavedEdits?.length) return null;

  return (
    <section className="unsaved-edits" aria-label="Unsaved changes">
      <h4>Unsaved changes ({unsavedEdits.length})</h4>
      <p>
        These changes were submitted from another editor window but were not
        saved, because the article had already been updated. The editor below
        shows the last saved version. For each of them you can{" "}
        <strong>append</strong> its text and tags to those of the article,{" "}
        <strong>merge</strong> it with the article or{" "}
        <strong>overwrite</strong> the article with it. Nothing is saved until
        you press “Update Article”.
      </p>
      <ul>
        {unsavedEdits.map((unsavedEdit) => (
          <UnsavedEdit
            applied={appliedIds.includes(unsavedEdit.id)}
            disabled={disabled}
            highlighted={unsavedEdit.id === highlightedId}
            key={unsavedEdit.id}
            onApply={onApply}
            onDiscard={onDiscard}
            saved={saved}
            unsavedEdit={unsavedEdit}
          />
        ))}
      </ul>
    </section>
  );
}

export default UnsavedEdits;
