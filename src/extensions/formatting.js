import { isHeadingActive, setParagraph, toggleHeading } from "./headings.js";

/**
 * TipTap-inspired command & active-state adapter on top of Squire.
 */

export function isActive(squire, name, attrs = {}) {
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

export function getActiveState(squire) {
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

export function execCommand(squire, command, arg) {
  if (!squire) return;
  switch (command) {
    case "bold":
      isActive(squire, "bold") ? squire.removeBold() : squire.bold();
      break;
    case "italic":
      isActive(squire, "italic") ? squire.removeItalic() : squire.italic();
      break;
    case "underline":
      isActive(squire, "underline") ? squire.removeUnderline() : squire.underline();
      break;
    case "strike":
      isActive(squire, "strike")
        ? squire.changeFormat(null, { tag: "S" })
        : squire.changeFormat({ tag: "S" }, null);
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
      squire.hasFormat("UL") ? squire.removeList() : squire.makeUnorderedList();
      break;
    case "orderedList":
      squire.hasFormat("OL") ? squire.removeList() : squire.makeOrderedList();
      break;
    case "blockquote":
      squire.hasFormat("BLOCKQUOTE") ? squire.decreaseQuoteLevel() : squire.increaseQuoteLevel();
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
