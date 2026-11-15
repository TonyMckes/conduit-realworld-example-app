// Line based diff and merge, used to bring changes that could not be saved
// from one editor (see UnsavedEdits) back into the article.

// Above this the comparison table gets too big, so the lines in between the
// common start and end of both texts are treated as entirely different.
const MAX_TABLE_CELLS = 4_000_000;

const CONFLICT_START = "<<<<<<<";
const CONFLICT_MIDDLE = "=======";
const CONFLICT_END = ">>>>>>>";

const toLines = (text) => text.split("\n");

const sameLines = (a, b) =>
  a.length === b.length && a.every((line, index) => line === b[index]);

// Pairs [index in a, index in b] of the lines of a longest common subsequence
function matchLines(a, b) {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) {
    start++;
  }

  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const matches = [];
  for (let i = 0; i < start; i++) matches.push([i, i]);

  const rows = endA - start;
  const cols = endB - start;
  if (rows > 0 && cols > 0 && rows * cols <= MAX_TABLE_CELLS) {
    // lengths[i * width + j]: common lines of a[start + i..] and b[start + j..]
    const width = cols + 1;
    const lengths = new Uint32Array((rows + 1) * width);
    for (let i = rows - 1; i >= 0; i--) {
      for (let j = cols - 1; j >= 0; j--) {
        lengths[i * width + j] =
          a[start + i] === b[start + j]
            ? lengths[(i + 1) * width + j + 1] + 1
            : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < rows && j < cols) {
      if (a[start + i] === b[start + j]) {
        matches.push([start + i, start + j]);
        i++;
        j++;
      } else if (lengths[(i + 1) * width + j] >= lengths[i * width + j + 1]) {
        i++;
      } else {
        j++;
      }
    }
  }

  for (let i = endA, j = endB; i < a.length; i++, j++) matches.push([i, j]);

  return matches;
}

/**
 * Lines that have to be removed from / added to `from` to get `to`.
 * @returns {{ type: "same" | "removed" | "added", line: string }[]}
 */
export function diffLines(from, to) {
  const a = toLines(from);
  const b = toLines(to);
  const diff = [];
  let i = 0;
  let j = 0;

  for (const [matchA, matchB] of [...matchLines(a, b), [a.length, b.length]]) {
    while (i < matchA) diff.push({ type: "removed", line: a[i++] });
    while (j < matchB) diff.push({ type: "added", line: b[j++] });
    if (i < a.length) diff.push({ type: "same", line: a[i] });
    i++;
    j++;
  }

  return diff;
}

/**
 * Three-way merge of two texts that were both edited starting from `base`.
 * Changes made on one side only are combined. Where both sides changed the
 * same lines differently both are kept, wrapped in conflict markers, so
 * nothing is dropped. Without a `base` every line found in either text is
 * kept.
 * @returns {{ text: string, conflicts: number }}
 */
export function mergeText({
  base,
  ours,
  theirs,
  oursLabel = "ours",
  theirsLabel = "theirs",
}) {
  if (ours === theirs) return { text: ours, conflicts: 0 };

  const o = toLines(ours);
  const t = toLines(theirs);
  const b =
    typeof base === "string"
      ? toLines(base)
      : matchLines(o, t).map(([index]) => o[index]);
  const inOurs = new Map(matchLines(b, o));
  const inTheirs = new Map(matchLines(b, t));

  const merged = [];
  let conflicts = 0;
  let bi = 0;
  let oi = 0;
  let ti = 0;

  while (bi < b.length || oi < o.length || ti < t.length) {
    // Line untouched by both sides
    if (bi < b.length && inOurs.get(bi) === oi && inTheirs.get(bi) === ti) {
      merged.push(b[bi]);
      bi++;
      oi++;
      ti++;
      continue;
    }

    // Changed lines, up to the next base line both sides still have
    let next = bi;
    while (next < b.length && !(inOurs.has(next) && inTheirs.has(next))) {
      next++;
    }
    const oursEnd = next < b.length ? inOurs.get(next) : o.length;
    const theirsEnd = next < b.length ? inTheirs.get(next) : t.length;

    const baseLines = b.slice(bi, next);
    const ourLines = o.slice(oi, oursEnd);
    const theirLines = t.slice(ti, theirsEnd);

    let lines;
    if (sameLines(ourLines, theirLines) || sameLines(theirLines, baseLines)) {
      lines = ourLines;
    } else if (sameLines(ourLines, baseLines)) {
      lines = theirLines;
    } else {
      conflicts++;
      lines = [
        `${CONFLICT_START} ${oursLabel}`,
        ...ourLines,
        CONFLICT_MIDDLE,
        ...theirLines,
        `${CONFLICT_END} ${theirsLabel}`,
      ];
    }
    for (const line of lines) merged.push(line);

    bi = next;
    oi = oursEnd;
    ti = theirsEnd;
  }

  return { text: merged.join("\n"), conflicts };
}

// Whether a text still has the markers `mergeText` puts around conflicts
export function hasConflictMarkers(text) {
  return new RegExp(`^(${CONFLICT_START}|${CONFLICT_END}) `, "m").test(text);
}

const isText = (value) => typeof value === "string";

// Same as `mergeText` for a single-line value. A conflict keeps `ours`.
function mergeValue({ base, ours, theirs }) {
  if (!isText(theirs) || theirs === ours) return { value: ours };
  if (isText(base) && theirs === base) return { value: ours };
  if (isText(base) && ours === base) return { value: theirs };

  return { value: ours, conflict: true };
}

/**
 * Tag names of a tags field, which is a list or what was typed in the tags
 * input: trimmed, without blanks and duplicates.
 * @returns {string[]}
 */
export function toTagList(tags) {
  const names = Array.isArray(tags) ? tags : String(tags ?? "").split(/,| /);

  return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
}

export function sameTagList(a, b) {
  const tagsA = toTagList(a);
  const tagsB = toTagList(b);

  return tagsA.length === tagsB.length && tagsA.every((tag) => tagsB.includes(tag));
}

// Tags added on either side are kept, tags removed since `base` are removed.
// Without a `base` every tag of both is kept.
function mergeTagList({ base, ours, theirs }) {
  const added = theirs.filter((tag) => !ours.includes(tag));
  if (!Array.isArray(base)) return [...ours, ...added];

  const removed = base.filter((tag) => !theirs.includes(tag));

  return [
    ...ours.filter((tag) => !removed.includes(tag)),
    ...added.filter((tag) => !base.includes(tag)),
  ];
}

/**
 * Brings an unsaved edit into the article fields currently in the editor.
 * - "overwrite": the unsaved edit replaces the fields
 * - "append": the unsaved body is added after the body, the unsaved tags
 *   after the tags
 * - "merge": changes of both are combined (see `mergeText`)
 *
 * @returns {{
 *   fields: { title: string, description: string, body: string, tagList: string[] },
 *   conflicts: { title: boolean, description: boolean, body: number },
 * }}
 */
export function applyUnsavedEdit(mode, current, unsavedEdit, labels = {}) {
  const conflicts = { title: false, description: false, body: 0 };
  const ours = { ...current, tagList: toTagList(current.tagList) };
  // Fields the unsaved edit doesn't have were not changed by it
  const theirs = {
    title: isText(unsavedEdit.title) ? unsavedEdit.title : ours.title,
    description: isText(unsavedEdit.description)
      ? unsavedEdit.description
      : ours.description,
    body: isText(unsavedEdit.body) ? unsavedEdit.body : ours.body,
    tagList: Array.isArray(unsavedEdit.tagList)
      ? toTagList(unsavedEdit.tagList)
      : ours.tagList,
  };

  if (mode === "overwrite") return { fields: theirs, conflicts };

  if (mode === "append") {
    const body = isText(unsavedEdit.body)
      ? [ours.body, unsavedEdit.body].filter(Boolean).join("\n\n")
      : ours.body;
    const tagList = mergeTagList({ ours: ours.tagList, theirs: theirs.tagList });

    return { fields: { ...ours, body, tagList }, conflicts };
  }

  const base = unsavedEdit.base || {};
  const title = mergeValue({
    base: base.title,
    ours: ours.title,
    theirs: theirs.title,
  });
  const description = mergeValue({
    base: base.description,
    ours: ours.description,
    theirs: theirs.description,
  });
  const body = mergeText({
    base: base.body,
    ours: ours.body,
    theirs: theirs.body,
    oursLabel: labels.ours,
    theirsLabel: labels.theirs,
  });
  const tagList = mergeTagList({
    base: base.tagList,
    ours: ours.tagList,
    theirs: theirs.tagList,
  });

  return {
    fields: {
      title: title.value,
      description: description.value,
      body: body.text,
      tagList,
    },
    conflicts: {
      title: Boolean(title.conflict),
      description: Boolean(description.conflict),
      body: body.conflicts,
    },
  };
}
