document.getElementById("highlightToggle").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleHighlighter" });
  });
});


let selectedColor = "yellow"; // Default color

document.addEventListener("DOMContentLoaded", () => {
  const colorSwatches = document.querySelectorAll(".color-swatch");

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const selectedColor = swatch.dataset.color;
      setSelectedHighlighterColor(selectedColor);
    });
  });
});

function setSelectedHighlighterColor(color) {
  const selectedColorSwatch = document.getElementById(
    "selectedHighlighterColor"
  );
  selectedColorSwatch.style.backgroundColor = color;

  // Store the selected color in local storage
  localStorage.setItem("selectedHighlightColor", color);

  // Send a message to the content script to update the default highlight color
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "updateHighlightColor",
      color,
    });
  });
  console.log("Selected highlighter color:", color);
}

document.addEventListener("DOMContentLoaded", async () => {
  const annotationsContainer = document.getElementById("annotations-container");
  const searchInput = document.getElementById("search-input");

  try {
    // Fetch annotations from the background script
    const annotations = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.runtime.sendMessage(
          { action: "getAnnotations", url },
          (response) => {
            if (response && response.annotations) {
              resolve(response.annotations);
            } else {
              reject("Error fetching annotations");
            }
          }
        );
      });
    });

    console.log('Annotations: ', annotations);

    // Clear the container
    annotationsContainer.innerHTML = "";

    // Populate the container with annotations
    annotations.forEach((annotation) => {
      const annotationDiv = document.createElement("div");
      annotationDiv.textContent = annotation.text;
      const noteDiv = document.createElement('div');
      noteDiv.classList.add("annotation-note");
      noteDiv.textContent = 'Note: ' + (annotation.note !== null ? annotation.note : '');
      annotationDiv.appendChild(noteDiv);
      annotationDiv.classList.add("annotation");
      annotationDiv.style.backgroundColor = annotation.color;
      annotationsContainer.appendChild(annotationDiv);
    });

    // Add event listener for search input
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredAnnotations = annotations.filter(annotation => annotation.text.toLowerCase().includes(searchTerm));
      renderAnnotations(filteredAnnotations);
    });

    // Function to render annotations
    function renderAnnotations(annotations) {
      annotationsContainer.innerHTML = "";
      annotations.forEach((annotation) => {
        const annotationDiv = document.createElement("div");
        annotationDiv.textContent = annotation.text;
        const noteDiv = document.createElement('div');
        // adding class for note
        noteDiv.classList.add("annotation-note");
        noteDiv.classList.add("border");
        noteDiv.classList.add("border-1");
        noteDiv.classList.add("p-2");
        noteDiv.classList.add("rounded");

        noteDiv.textContent = 'Note: ' + (annotation.note !== null ? annotation.note : '');
        annotationDiv.appendChild(noteDiv);

        // adding class for annotaions 
        annotationDiv.classList.add("annotation");
        annotationDiv.classList.add("rounded");
        annotationDiv.classList.add("p-3");

        annotationDiv.style.backgroundColor = annotation.color;
        annotationsContainer.appendChild(annotationDiv);
      });
    }

    // Export annotations to PDF
    document.getElementById("exportPDF").addEventListener("click", async() => {
      // Options for PDF generation
      const pdfMargin = { top: 20, right: 20, bottom: 20, left: 20 };
      const options = {
        filename: "annotations.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { format: 'a4' },
        pagebreak: { mode: 'avoid-all', before: '#page2el' },
        margin: 5
      };
  
      // Generate PDF
      try{
        await html2pdf().from(annotationsContainer).set(options).save();
      }
      catch(error){
        console.log(error);
      }
    });

    
  } catch (error) {
    console.error(error);
  }
});
