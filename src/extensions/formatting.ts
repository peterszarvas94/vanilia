import type Squire from "squire-rte";
import { isHeadingActive, setParagraph, toggleHeading, type HeadingLevel } from "./headings.js";

/**
 * TipTap-inspired command & active-state adapter on top of Squire.
 */

/** Names accepted by `isActive()`. */
export type FormatName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "link"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "heading"
  | "paragraph";

/** Commands accepted by `editor.exec()`. */
export type Command =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "hr"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "clearFormatting"
  | "undo"
  | "redo"
  | "makeLink"
  | "removeLink";

/** Which formats are active at the selection. */
export interface ActiveState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  link: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  paragraph: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
}

export function isActive(
  squire: Squire | null,
  name: string,
  attrs: { level?: HeadingLevel } = {},
): boolean {
  if (!squire) return false;
  switch (name) {
    case "bold":
      return squire.hasFormat("B") || squire.hasFormat("STRONG");
    case "italic":
      return squire.hasFormat("I") || squire.hasFormat("EM");
    case "underline":
      return squire.hasFormat("U");
    case "strike":
      return squire.hasFormat("S") || squire.hasFormat("DEL");
    case "code":
      return squire.hasFormat("CODE") || squire.hasFormat("PRE");
    case "link":
      return squire.hasFormat("A");
    case "bulletList":
      return squire.hasFormat("UL");
    case "orderedList":
      return squire.hasFormat("OL");
    case "blockquote":
      return squire.hasFormat("BLOCKQUOTE");
    case "heading":
      return isHeadingActive(squire, attrs.level);
    case "paragraph":
      return (
        !isHeadingActive(squire) &&
        !squire.hasFormat("UL") &&
        !squire.hasFormat("OL") &&
        !squire.hasFormat("BLOCKQUOTE") &&
        !squire.hasFormat("PRE")
      );
    default:
      return false;
  }
}

export function getActiveState(squire: Squire | null): ActiveState {
  return {
    bold: isActive(squire, "bold"),
    italic: isActive(squire, "italic"),
    underline: isActive(squire, "underline"),
    strike: isActive(squire, "strike"),
    code: isActive(squire, "code"),
    link: isActive(squire, "link"),
    bulletList: isActive(squire, "bulletList"),
    orderedList: isActive(squire, "orderedList"),
    blockquote: isActive(squire, "blockquote"),
    paragraph: isActive(squire, "paragraph"),
    h1: isActive(squire, "heading", { level: 1 }),
    h2: isActive(squire, "heading", { level: 2 }),
    h3: isActive(squire, "heading", { level: 3 }),
  };
}

export function execCommand(squire: Squire | null, command: string, arg?: string): void {
  if (!squire) return;
  switch (command) {
    case "bold":
      if (isActive(squire, "bold")) squire.removeBold();
      else squire.bold();
      break;
    case "italic":
      if (isActive(squire, "italic")) squire.removeItalic();
      else squire.italic();
      break;
    case "underline":
      if (isActive(squire, "underline")) squire.removeUnderline();
      else squire.underline();
      break;
    case "strike":
      if (isActive(squire, "strike")) squire.changeFormat(null, { tag: "S" });
      else squire.changeFormat({ tag: "S" }, null);
      break;
    case "code":
      squire.toggleCode();
      break;
    case "paragraph":
      setParagraph(squire);
      break;
    case "h1":
      toggleHeading(squire, 1);
      break;
    case "h2":
      toggleHeading(squire, 2);
      break;
    case "h3":
      toggleHeading(squire, 3);
      break;
    case "bulletList":
      if (squire.hasFormat("UL")) squire.removeList();
      else squire.makeUnorderedList();
      break;
    case "orderedList":
      if (squire.hasFormat("OL")) squire.removeList();
      else squire.makeOrderedList();
      break;
    case "blockquote":
      if (squire.hasFormat("BLOCKQUOTE")) squire.decreaseQuoteLevel();
      else squire.increaseQuoteLevel();
      break;
    case "hr":
      squire.insertHTML("<hr><p><br></p>");
      break;
    case "alignLeft":
      squire.setTextAlignment("left");
      break;
    case "alignCenter":
      squire.setTextAlignment("center");
      break;
    case "alignRight":
      squire.setTextAlignment("right");
      break;
    case "clearFormatting":
      squire.removeAllFormatting();
      break;
    case "undo":
      squire.undo();
      break;
    case "redo":
      squire.redo();
      break;
    case "makeLink":
      if (arg) squire.makeLink(arg, { target: "_blank", rel: "noopener noreferrer" });
      break;
    case "removeLink":
      squire.removeLink();
      break;
    default:
      break;
  }
}
