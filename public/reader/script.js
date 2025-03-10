const urlParams = new URLSearchParams(window.location.search);
const filewebUrl = urlParams.get('fileweb');

if (!filewebUrl) {
    console.error('No file URL provided in the query parameter.');
} else {
    let pdfDoc = null, currentPage = 1, totalPages = 0, scale = 1, minScale = 1;
    let isDragging = false, startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    const pageContainer = document.getElementById('page-container');
    const pageNumDisplay = document.getElementById('page-num');
    const pageInput = document.getElementById('page-input');
    const jumpBtn = document.getElementById('jump-btn');

    // Function to check the file type
    function getFileType(url) {
        return url && url.split('.').pop().toLowerCase();
    }

    // Function to render PDF files
    function renderPDF(fileUrl) {
        pdfjsLib.getDocument(fileUrl).promise.then((pdf) => {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            renderPages();
        });
    }

    // Function to render DOCX files
    function renderDOCX(fileUrl) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fileUrl, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            const arrayBuffer = xhr.response;
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then((result) => {
                    const docContainer = document.createElement('div');
                    docContainer.innerHTML = result.value;
                    pageContainer.innerHTML = '';  // Clear the existing content
                    pageContainer.appendChild(docContainer);  // Add the DOCX content
                })
                .catch((err) => console.error('Error reading DOCX file:', err));
        };
        xhr.send();
    }

    // Check the file extension
    const fileExtension = getFileType(filewebUrl);
    if (fileExtension === 'pdf') {
        renderPDF(filewebUrl);
    } else if (fileExtension === 'docx') {
        renderDOCX(filewebUrl);
    } else {
        console.error('Unsupported file format');
    }

    // The rest of your PDF rendering code...
    function renderPages() {
        pageContainer.innerHTML = ""; // Clear previous content

        for (let i = 1; i <= totalPages; i++) {
            let canvas = document.createElement('canvas');
            canvas.classList.add('pdf-canvas');
            canvas.dataset.pageNumber = i;
            pageContainer.appendChild(canvas);

            renderPage(i, canvas);
        }

        // Ensure the page number is updated correctly after rendering pages
        updatePageNum();
    }

    function renderPage(pageNum, canvas) {
        pdfDoc.getPage(pageNum).then((page) => {
            const viewport = page.getViewport({ scale: 1 });
            minScale = Math.min(window.innerWidth / viewport.width, window.innerHeight / viewport.height);
            scale = minScale; // Set minimum scale

            const context = canvas.getContext('2d');
            canvas.width = viewport.width * scale;
            canvas.height = viewport.height * scale;

            const renderContext = {
                canvasContext: context,
                viewport: page.getViewport({ scale: scale })
            };

            page.render(renderContext).promise.then(() => {
                updatePageNum();  // Call it after rendering to make sure the current page is updated
            });
        });
    }

    function updatePageNum() {
        let visibleCanvas = [...document.getElementsByClassName('pdf-canvas')].reduce((mostVisibleCanvas, canvas) => {
            const rect = canvas.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // We want the canvas with the most area visible in the viewport
            const overlap = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
            if (overlap > 0 && overlap > (mostVisibleCanvas ? mostVisibleCanvas.overlap : 0)) {
                return { canvas, overlap };
            }
            return mostVisibleCanvas;
        }, null);

        if (visibleCanvas && visibleCanvas.canvas) {
            currentPage = parseInt(visibleCanvas.canvas.dataset.pageNumber);
            pageNumDisplay.textContent = `Seite ${currentPage} von ${totalPages}`;
            pageInput.value = currentPage;
        }
    }

    function smoothScrollToPage(pageNum) {
        let targetCanvas = document.querySelector(`.pdf-canvas[data-page-number='${pageNum}']`);
        if (targetCanvas) {
            window.scrollTo({
                top: targetCanvas.offsetTop,
                behavior: "smooth"
            });
        }
    }

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            smoothScrollToPage(currentPage);
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            smoothScrollToPage(currentPage);
        }
    });

    jumpBtn.addEventListener('click', () => {
        const targetPage = parseInt(pageInput.value);
        if (targetPage >= 1 && targetPage <= totalPages) {
            smoothScrollToPage(targetPage);
        }
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
        if (scale < 3) {
            scale += 0.2;
            updateZoom();
        }
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        if (scale > minScale) {
            scale -= 0.2;
            updateZoom();
        }
    });

    function updateZoom() {
        document.querySelectorAll('.pdf-canvas').forEach(canvas => {
            let viewport = pdfDoc.getPage(parseInt(canvas.dataset.pageNumber)).then(page => {
                let newViewport = page.getViewport({ scale: scale });
                canvas.width = newViewport.width;
                canvas.height = newViewport.height;
                page.render({ canvasContext: canvas.getContext('2d'), viewport: newViewport });
            });
        });
    }

    window.addEventListener('scroll', updatePageNum);
    window.addEventListener('resize', renderPages);
    window.addEventListener('resize', updatePageNum); // Ensure page number updates on resize as well
}
