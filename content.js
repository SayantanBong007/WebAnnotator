let highlighterEnabled = false;
let selectedColor = 'yellow';
let annotationIdCounter = 0; // Counter for generating unique annotation IDs
let currentAnnotations = [];

// Listener for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleHighlighter") {
    highlighterEnabled = !highlighterEnabled;
    document.body.style.cursor = highlighterEnabled ? "crosshair" : "default";
    console.log(`Highlighter is now ${highlighterEnabled ? "enabled" : "disabled"}.`);
  } else if (request.action === "updateHighlightColor") {
    const newColor = request.color;
    console.log("Updating default highlight color to:", newColor);
    selectedColor = newColor;
  }
});

// Event listener for text selection
document.addEventListener("mouseup", () => {
  if (!highlighterEnabled) return;

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    if (selectedColor) {
      console.log('Loaded selected color: ', selectedColor);
      const range = selection.getRangeAt(0);
      highlightSelection(range, selectedColor);

      const note = "";
      addAnnotation(range, selectedText, selectedColor, note);
    }
  }
});

// Function to highlight the selected text with a specified color
function highlightSelection(range, color, annot) {
  const span = document.createElement("span");
  span.style.backgroundColor = color;
  span.className = "web-annotator-highlight";
  span.style.position = "relative";

  if(annot){
    const annotId = annot.id;
    const annotation = currentAnnotations.find(annot => annot.id === annotId);
    const annotationId = annotation.id;
    span.dataset.annotationId = annotationId;
  }else{
    const annotationId = `annotation-${annotationIdCounter++}`;
    span.dataset.annotationId = annotationId;
  }

  range.surroundContents(span);

  const deleteButton = document.createElement("img");
  deleteButton.id = "highlighter-delete-button";
  // deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
  deleteButton.src = 'https://www.pikpng.com/pngl/m/247-2474264_png-file-svg-delete-icon-svg-clipart.png';
  // deleteButton.textContent = "Delete";
  // deleteButton.style.position = "absolute";
  // deleteButton.style.top = "-10px";
  deleteButton.style.right = "0";
  deleteButton.style.border = "none";
  deleteButton.style.cursor = "pointer";
  deleteButton.style.color = "#000";
  // deleteButton.style.padding = "2px 5px";
  deleteButton.style.fontWeight = "bold";
  deleteButton.style.height = "20px";
  deleteButton.style.width = "20px";

  const noteButton = document.createElement("img");
  noteButton.id = "highlighter-note-button";
  // noteButton.textContent = "Add Note";
  noteButton.src = 'https://icons.veryicon.com/png/o/miscellaneous/webapp/note-96.png';
  // noteButton.style.position = "absolute";
  // noteButton.style.top = "-10px";
  // noteButton.style.right = "20px";
  noteButton.style.border = "none";
  noteButton.style.cursor = "pointer";
  noteButton.style.color = "#000";
  // noteButton.style.padding = "2px 5px";
  noteButton.style.fontWeight = "bold";
  // noteButton.style.fontSize = "12px";
  noteButton.style.height = "20px";
  noteButton.style.width = "20px";

  const colorButton = document.createElement("img");
  colorButton.id = "highlighter-color-button";
  // colorButton.textContent = "Change Color";
  colorButton.src = 'https://cdn2.iconfinder.com/data/icons/art-tools-black/128/ArtIconSet_Black-Palette-512.png';
  // colorButton.style.position = "absolute";
  // colorButton.style.top = "-10px";
  // colorButton.style.right = "120px";
  colorButton.style.border = "none";
  colorButton.style.cursor = "pointer";
  colorButton.style.color = "#000";
  // colorButton.style.padding = "2px 5px";
  colorButton.style.fontWeight = "bold";
  // colorButton.style.fontSize = "12px";
  colorButton.style.height = "20px";
  colorButton.style.width = "20px";


  const toolkit = document.createElement("div");
  toolkit.className = "highlighted-toolkit";
  toolkit.style.display = "none";
  toolkit.style.position = "absolute";
  toolkit.style.backgroundColor = "#eff6ff";
  toolkit.style.padding = '5px';
  toolkit.style.gap = '2px';
  toolkit.appendChild(colorButton);
  toolkit.appendChild(noteButton);
  toolkit.appendChild(deleteButton);
  toolkit.style.width = 'auto';
  toolkit.style.height = 'auto';

  span.addEventListener('mouseenter', () => {
    span.appendChild(toolkit);
    toolkit.style.display = "flex";
    toolkit.style.top = '0';
    toolkit.style.right = '0';
  });

  span.addEventListener('mouseleave', () => {
    if (span.contains(toolkit)) {
      span.removeChild(toolkit);
    }
    toolkit.style.display = "none";
  });

  deleteButton.addEventListener('click', () => {
    const annotationId = span.dataset.annotationId;
    deleteAnnotation(annotationId);
    span.outerHTML = span.innerHTML;
  });

  noteButton.addEventListener('click', () => {
    const annotationId = span.dataset.annotationId;
    openNotePopup(annotationId);
  });

  colorButton.addEventListener('click', () => {
    const annotationId = span.dataset.annotationId;
    openColorPalettePopup(span, annotationId);
  });
}

// Function to add an annotation to the list and save it
function addAnnotation(range, text, color, note) {
  const annotation = {
    id: `annotation-${annotationIdCounter - 1}`,
    text: text,
    color: color,
    note: note,
    timestamp: new Date().toISOString(),
    startContainerXPath: getXPath(range.startContainer),
    startOffset: range.startOffset,
    endContainerXPath: getXPath(range.endContainer),
    endOffset: range.endOffset
  };
  console.log("Annotation to add:", annotation);
  currentAnnotations.push(annotation);
  console.log("Current annotations:", currentAnnotations);

  const url = window.location.href;
  (async () => {
    const response = await chrome.runtime.sendMessage({ action: "saveAnnotation", url, annotations: currentAnnotations });
    console.log(response);
  })();
}

// Function to delete an annotation
function deleteAnnotation(annotationId) {
  currentAnnotations = currentAnnotations.filter(annot => annot.id !== annotationId);
  console.log("Annotation deleted:", annotationId);
  console.log("Current annotations:", currentAnnotations);

  const url = window.location.href;
  (async () => {
    const response = await chrome.runtime.sendMessage({ action: "saveAnnotation", url, annotations: currentAnnotations });
    console.log(response);
  })();
}

// Function to open the note popup
function openNotePopup(annotationId) {
  const annotation = currentAnnotations.find(annot => annot.id === annotationId);
  const existingNote = annotation ? annotation.note : "";

  const popup = document.createElement("div");
  popup.id = "note-popup";
  popup.style.position = "fixed";
  popup.style.left = "50%";
  popup.style.top = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "10px";
  popup.style.padding = "10px";
  // popup.style.padding = "20px";
  popup.style.zIndex = "1000";

  const textarea = document.createElement("textarea");
  textarea.id = "note-textarea";
  textarea.style.width = "300px";
  textarea.style.height = "150px";
  textarea.value = existingNote; // Load existing note

  const saveButton = document.createElement("button");
  saveButton.id = "note-save-button";
  saveButton.textContent = "Save";
  saveButton.style.marginTop = "10px";
  saveButton.style.cursor = "pointer";

  const closeButton = document.createElement("button");
  closeButton.id = "note-close-button";
  closeButton.textContent = "Close";
  closeButton.style.marginTop = "10px";
  closeButton.style.marginLeft = "10px";
  closeButton.style.cursor = "pointer";

  popup.appendChild(textarea);
  popup.appendChild(saveButton);
  popup.appendChild(closeButton);
  document.body.appendChild(popup);

  // Save note button click handler
  saveButton.addEventListener('click', () => {
    const note = textarea.value;
    updateAnnotationNote(annotationId, note);
    document.body.removeChild(popup);
  });

  // Close button click handler
  closeButton.addEventListener('click', () => {
    document.body.removeChild(popup);
  });
}

// Function to update annotation note
function updateAnnotationNote(annotationId, note) {
  const annotation = currentAnnotations.find(annot => annot.id === annotationId);
  if (annotation) {
    annotation.note = note;
    console.log("Annotation updated:", annotation);
    console.log('currentAnnotations:', currentAnnotations);
    const url = window.location.href;
    (async () => {
      const response = await chrome.runtime.sendMessage({ action: "saveAnnotation", url, annotations: currentAnnotations });
      console.log(response);
    })();
  }
}

function openColorPalettePopup(span, annotationId) {
  const colors = ['yellow', 'cyan', 'magenta', 'lime', 'coral', 'turquoise', 'skyblue'];

  const popup = document.createElement("div");
  popup.id = "color-palette-popup";
  popup.style.position = "fixed";
  popup.style.left = "50%";
  popup.style.top = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "10px";
  popup.style.padding = "10px";
  popup.style.zIndex = "1000";

  colors.forEach(color => {
    const colorButton = document.createElement("button");
    // colorButton.textContent = color;
    colorButton.style.backgroundColor = color;
    colorButton.style.border = "none";
    colorButton.style.cursor = "pointer";
    colorButton.style.margin = "5px";
    colorButton.style.padding = "10px 10px";
    colorButton.style.borderRadius = "50%";
    colorButton.style.color = "#fff";
    colorButton.addEventListener('click', () => {
      span.style.backgroundColor = color;
      selectedColor = color;
      updateAnnotationColor(annotationId, color);
      document.body.removeChild(popup);
    });
    popup.appendChild(colorButton);
  });

  document.body.appendChild(popup);
}

// Function to update annotation color
function updateAnnotationColor(annotationId, color) {
  const annotation = currentAnnotations.find(annot => annot.id === annotationId);
  console.log(annotation, annotationId);
  if (annotation) {
    annotation.color = color;
    console.log("Annotation updated:", annotation);
    console.log('currentAnnotations: ', currentAnnotations);
    const url = window.location.href;
    (async () => {
      const response = await chrome.runtime.sendMessage({ action: "saveAnnotation", url, annotations: currentAnnotations });
      console.log(response);
    })();
  }
}

// Function to get the XPath of a node
function getXPath(node) {
  if (node.id !== "") {
    return `//*[@id="${node.id}"]`;
  }
  if (node === document.body) {
    return "/html/body";
  }

  const parts = [];
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = node.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) {
        sibling = sibling.previousSibling;
        continue;
      }
      if (sibling.nodeName === node.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const nodeName = node.nodeName.toLowerCase();
    const pathIndex = (index ? `[${index + 1}]` : "");
    parts.unshift(nodeName + pathIndex);
    node = node.parentNode;
  }
  return parts.length ? "/" + parts.join("/") : null;
}

// Restore annotations on page load
window.onload = () => {
  const url = window.location.href;
  chrome.runtime.sendMessage({ action: "getAnnotations", url }, (response) => {
    currentAnnotations = response.annotations || [];
    console.log(response);
    console.log("Loaded annotations:", currentAnnotations);
    currentAnnotations.forEach(annot => {
      highlightExistingText(annot);
    });
  });
};

// Function to highlight existing text based on stored annotations
function highlightExistingText(annot) {
  const searchText = annot.text.trim();
  if (!searchText) {
    console.warn("Empty text provided for annotation:", annot);
    return;
  }

  const element = getElementByXPath(annot.startContainerXPath);
  if (!element) {
    console.warn("Element not found for XPath:", annot.startContainerXPath);
    return;
  }

  findAndHighlightRanges(element, searchText, annot.color, annot);
}

// Function to find and highlight text ranges within a node
function findAndHighlightRanges(node, searchText, color, annot) {
  const strippedText = stripHTMLTags(node.innerHTML);
  const startIndexes = [];
  let startIndex = 0;

  while ((startIndex = strippedText.indexOf(searchText, startIndex)) !== -1) {
    startIndexes.push(startIndex);
    startIndex += searchText.length;
  }

  startIndexes.forEach(startIdx => {
    let range = document.createRange();
    let charCount = 0;
    let endNode, endOffset;

    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    let currentNode = treeWalker.nextNode();

    while (currentNode) {
      let remainingLength = searchText.length - charCount;

      if (startIdx < currentNode.length + charCount && startIdx >= charCount) {
        let rangeStartOffset = startIdx - charCount;
        range.setStart(currentNode, rangeStartOffset);
      }

      if (startIdx + searchText.length <= currentNode.length + charCount) {
        endNode = currentNode;
        endOffset = startIdx + searchText.length - charCount;
        range.setEnd(endNode, endOffset);
        highlightSelection(range, color, annot);
        break;
      }

      charCount += currentNode.length;
      currentNode = treeWalker.nextNode();
    }
  });
}

// Function to strip HTML tags from a string
function stripHTMLTags(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}

// Function to get the element by its XPath
function getElementByXPath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
