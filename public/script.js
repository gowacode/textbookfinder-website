// script.js (Client-Side - to be included in your HTML)

document.addEventListener('DOMContentLoaded', function() {
    // Modal setup
    const modal = document.getElementById('aboutModal');
    const aboutLink = document.getElementById('aboutLink');
    const closeBtn = modal.querySelector('.close');

    if (aboutLink && modal && closeBtn) {
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });

        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.warn("Modal elements not found. Modal functionality will be disabled.");
    }

    // Form setup
    const form = document.querySelector('.search-form');
    
    if (form) {
        const resetButton = form.querySelector('button[type="reset"]');
        const isbnInput = form.querySelector('#isbn');

        if (isbnInput) {
            isbnInput.addEventListener('input', (e) => {
                const isbn = e.target.value.trim();
                if (isbn && !isValidISBN(isbn)) {
                    isbnInput.setCustomValidity('Please enter a valid ISBN (10 or 13 digits)');
                    isbnInput.reportValidity();
                } else {
                    isbnInput.setCustomValidity('');
                }
            });
        } else {
            console.warn("ISBN input not found.");
        }

        form.addEventListener('reset', (e) => {
            console.log('Form reset triggered');
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) resultsDiv.innerHTML = '';
            if (isbnInput) isbnInput.setCustomValidity('');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isbn = form.isbn ? form.isbn.value.trim() : '';
            const title = form.title ? form.title.value.trim() : '';
            const author = form.author ? form.author.value.trim() : '';
            const language = form.language ? form.language.value : 'english';

            if (isbnInput && isbn && !isValidISBN(isbn)) {
                alert('Please enter a valid ISBN (10 or 13 digits) or clear the ISBN field.');
                isbnInput.focus();
                return;
            }

            let searchQuery = '';
            if (isbn) {
                searchQuery = `"${isbn}"`;
            } else if (title || author) {
                searchQuery = `${title} ${author}`;
            }

            if (searchQuery) {
                await searchForTextbook(searchQuery.trim());
                
                const resultsDiv = document.getElementById('results');
                if (resultsDiv) {
                    resultsDiv.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                alert("Please enter either ISBN or Title/Author!");
            }
        });
    } else {
        console.error("Search form '.search-form' not found. Search functionality will be disabled.");
    }
});

// ISBN validation
function isValidISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return /^(\d{10}|\d{13})$/.test(cleanISBN);
}

// Search functionality
async function searchForTextbook(query) {
    let resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(resultsDiv);
        } else {
            console.error("Element with class '.search-container' not found. Cannot display results.");
            document.body.appendChild(resultsDiv);
        }
    }

    resultsDiv.innerHTML = "<h2>Search Results</h2><p>Searching for textbooks...</p>";
    
    const encodedQuery = encodeURIComponent(query);
    const url = `/api/search?query=${encodedQuery}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Full error object from server:", data);
            resultsDiv.innerHTML = `<h2>Search Results</h2><p>An error occurred: ${(data.error && data.error.message) || 'Please try again.'}</p>`;
            return;
        }
        
        displayResults(data.items);
    } catch (error) {
        console.error("Error fetching results from your server:", error);
        resultsDiv.innerHTML = "<h2>Search Results</h2><p>An error occurred while connecting to the server. Please check your internet connection or try again later.</p>";
    }
}

// Results display
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = "<h2>Search Results</h2>";
  
    if (!results || results.length === 0) {
        resultsDiv.innerHTML += "<p>No results found. Try a different search.</p>";
        return;
    }
  
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';
  
    results.forEach((item) => {
        const resultElement = document.createElement('div');
        resultElement.className = "result-item";
        
        const title = item.title || "No title available";
        const snippet = item.snippet || "No description available.";
        const link = item.link || "#";

        resultElement.innerHTML = `
            <h3>${title}</h3>
            <p>${snippet}</p>
            <a href="${link}" target="_blank" class="download-link">View Resource</a>
        `;
        
        resultsContainer.appendChild(resultElement);
    });
    
    resultsDiv.appendChild(resultsContainer);
}