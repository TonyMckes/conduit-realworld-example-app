import {
  applyUnsavedEdit,
  diffLines,
  hasConflictMarkers,
  mergeText,
  sameTagList,
  toTagList,
} from "./mergeText";

const text = (...lines) => lines.join("\n");

describe("diffLines", () => {
  test("marks removed, added and unchanged lines", () => {
    expect(diffLines(text("a", "b", "c"), text("a", "x", "c", "d"))).toEqual([
      { type: "same", line: "a" },
      { type: "removed", line: "b" },
      { type: "added", line: "x" },
      { type: "same", line: "c" },
      { type: "added", line: "d" },
    ]);
  });

  test("identical texts have no changes", () => {
    const diff = diffLines(text("a", "b"), text("a", "b"));

    expect(diff.every(({ type }) => type === "same")).toBe(true);
    expect(diff).toHaveLength(2);
  });
});

describe("mergeText", () => {
  const base = text("intro", "", "middle", "", "end");

  test("combines changes made to different parts", () => {
    const ours = text("intro (saved)", "", "middle", "", "end");
    const theirs = text("intro", "", "middle", "", "end (unsaved)", "extra");

    expect(mergeText({ base, ours, theirs })).toEqual({
      text: text("intro (saved)", "", "middle", "", "end (unsaved)", "extra"),
      conflicts: 0,
    });
  });

  test("keeps a deletion made on one side", () => {
    const ours = text("middle", "", "end");
    const theirs = text("intro", "", "middle", "", "end!");

    expect(mergeText({ base, ours, theirs })).toEqual({
      text: text("middle", "", "end!"),
      conflicts: 0,
    });
  });

  test("takes the other side when only one side changed", () => {
    const changed = text("new intro", "", "middle", "", "end");

    expect(mergeText({ base, ours: base, theirs: changed }).text).toBe(changed);
    expect(mergeText({ base, ours: changed, theirs: base }).text).toBe(changed);
    expect(mergeText({ base, ours: changed, theirs: changed })).toEqual({
      text: changed,
      conflicts: 0,
    });
  });

  test("keeps both versions of a part changed on both sides", () => {
    const ours = text("intro", "", "middle (saved)", "", "end");
    const theirs = text("intro", "", "middle (unsaved)", "", "end");

    expect(
      mergeText({ base, ours, theirs, oursLabel: "A", theirsLabel: "B" }),
    ).toEqual({
      text: text(
        "intro",
        "",
        "<<<<<<< A",
        "middle (saved)",
        "=======",
        "middle (unsaved)",
        ">>>>>>> B",
        "",
        "end",
      ),
      conflicts: 1,
    });
  });

  test("without a base no line of either text is dropped", () => {
    const ours = text("intro", "only saved", "end");
    const theirs = text("intro", "end", "only unsaved");

    expect(mergeText({ base: null, ours, theirs })).toEqual({
      text: text("intro", "only saved", "end", "only unsaved"),
      conflicts: 0,
    });

    const conflict = mergeText({
      base: null,
      ours: text("intro", "saved", "end"),
      theirs: text("intro", "unsaved", "end"),
    });
    expect(conflict.conflicts).toBe(1);
    expect(conflict.text).toContain("saved");
    expect(conflict.text).toContain("unsaved");
  });

  test("never loses a line that was added on either side", () => {
    // Deterministic pseudo random edits of a shared base
    let seed = 7;
    const random = (max) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % max;
    };
    const edit = (lines, tag) => {
      const edited = [...lines];
      for (let i = 0; i < 4; i++) {
        const at = random(edited.length + 1);
        if (random(3) === 0 && edited.length > 1) edited.splice(at, 1);
        else edited.splice(at, random(2), `${tag}-${i}-${random(1000)}`);
      }
      return edited;
    };

    for (let round = 0; round < 200; round++) {
      const baseLines = Array.from({ length: 2 + random(10) }, (_, i) => `l${i}`);
      const ours = edit(baseLines, "o");
      const theirs = edit(baseLines, "t");
      const merged = mergeText({
        base: baseLines.join("\n"),
        ours: ours.join("\n"),
        theirs: theirs.join("\n"),
      }).text.split("\n");

      const added = [...ours, ...theirs].filter((line) => /^[ot]-/.test(line));
      expect(merged).toEqual(expect.arrayContaining(added));
    }
  });
});

describe("hasConflictMarkers", () => {
  test("detects the markers mergeText adds", () => {
    const { text: merged } = mergeText({ base: "a", ours: "b", theirs: "c" });

    expect(hasConflictMarkers(merged)).toBe(true);
  });

  test("ignores regular markdown", () => {
    expect(hasConflictMarkers(text("Title", "=======", "> quote"))).toBe(false);
  });
});

describe("toTagList", () => {
  test("gives the tag names of a list or of what was typed", () => {
    expect(toTagList(["one", " two ", "", "one"])).toEqual(["one", "two"]);
    expect(toTagList("one, two,,one three")).toEqual(["one", "two", "three"]);
    expect(toTagList("")).toEqual([]);
    expect(toTagList(undefined)).toEqual([]);
  });
});

describe("sameTagList", () => {
  test("ignores order, blanks and duplicates", () => {
    expect(sameTagList(["one", "two"], ["two", "one", ""])).toBe(true);
    expect(sameTagList(["one", "two"], ["one"])).toBe(false);
    expect(sameTagList(["one"], ["two"])).toBe(false);
  });
});

describe("applyUnsavedEdit", () => {
  const current = {
    title: "Saved",
    description: "About",
    body: "saved body",
    tagList: ["one", "saved"],
  };
  const unsavedEdit = {
    title: "Unsaved",
    description: "About",
    body: "unsaved body",
    tagList: ["two", "unsaved"],
    base: {
      title: "Saved",
      description: "About",
      body: "body",
      tagList: ["one", "two"],
    },
  };

  test("overwrite replaces the fields", () => {
    expect(applyUnsavedEdit("overwrite", current, unsavedEdit).fields).toEqual({
      title: "Unsaved",
      description: "About",
      body: "unsaved body",
      tagList: ["two", "unsaved"],
    });
  });

  test("overwrite keeps fields the unsaved edit doesn't have", () => {
    const { fields } = applyUnsavedEdit("overwrite", current, {
      title: null,
      description: null,
      body: "unsaved body",
      tagList: null,
    });

    expect(fields).toEqual({ ...current, body: "unsaved body" });
  });

  test("append adds the unsaved body and tags after the current ones", () => {
    expect(applyUnsavedEdit("append", current, unsavedEdit).fields).toEqual({
      ...current,
      body: "saved body\n\nunsaved body",
      tagList: ["one", "saved", "two", "unsaved"],
    });
  });

  test("merge combines the fields and reports conflicts", () => {
    const { fields, conflicts } = applyUnsavedEdit(
      "merge",
      { ...current, description: "About (saved)" },
      { ...unsavedEdit, description: "About (unsaved)" },
    );

    // Only changed in the unsaved edit
    expect(fields.title).toBe("Unsaved");
    // Changed in both: the current one is kept
    expect(fields.description).toBe("About (saved)");
    expect(fields.body).toContain("saved body");
    expect(fields.body).toContain("unsaved body");
    expect(conflicts).toEqual({ title: false, description: true, body: 1 });
  });

  test("merge keeps the tags each side added and drops the ones each side removed", () => {
    // Current: removed "two", added "saved". Unsaved: removed "one", added
    // "unsaved".
    const { fields } = applyUnsavedEdit("merge", current, unsavedEdit);

    expect(fields.tagList).toEqual(["saved", "unsaved"]);
  });

  test("merge without a base keeps every tag and treats different values as a conflict", () => {
    const { fields, conflicts } = applyUnsavedEdit("merge", current, {
      ...unsavedEdit,
      base: null,
    });

    expect(fields.title).toBe("Saved");
    expect(fields.tagList).toEqual(["one", "saved", "two", "unsaved"]);
    expect(conflicts.title).toBe(true);
    expect(conflicts.description).toBe(false);
  });

  test("takes the tags of the editor as they were typed", () => {
    const { fields } = applyUnsavedEdit(
      "append",
      { ...current, tagList: ["one", "", "saved"] },
      { ...unsavedEdit, tagList: ["three"] },
    );

    expect(fields.tagList).toEqual(["one", "saved", "three"]);
  });
});
