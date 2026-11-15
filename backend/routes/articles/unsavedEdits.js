const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/authentication");
const {
  allUnsavedEdits,
  setUnsavedEditBase,
  deleteUnsavedEdit,
} = require("../../controllers/unsavedEdits");

//? All Unsaved Edits for Article
router.get("/:slug/unsaved-edits", verifyToken, allUnsavedEdits);
//* Set the base version of an Unsaved Edit
router.put("/:slug/unsaved-edits/:editId", verifyToken, setUnsavedEditBase);
//* Delete Unsaved Edit for Article
router.delete("/:slug/unsaved-edits/:editId", verifyToken, deleteUnsavedEdit);

module.exports = router;
