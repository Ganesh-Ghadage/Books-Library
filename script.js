// function to fetch data from FreeAPI Books endpoint
async function fetchBooks(page = 3) {
    const url = `https://api.freeapi.app/api/v1/public/books?page=${page}`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    try {
      let responce = await fetch(url, options)
      let data = await responce.json()
      return data
    } catch (error) {
      console.log('Error while fetching data ', error)
      return null
    }
}
  

  
// grab required elements
const bookContainer = document.querySelector('.bookContainer')
const errorContainer = document.querySelector('.errorContainer')
const loadingContainer = document.querySelector('.loadingContainer')

const searchInput = document.getElementById('searchInput')
const searchByInput = document.getElementById('searchBy')
const searchButton = document.getElementById('searchButton')
const resultTextDisplay = document.getElementById('resultText')

let allBooks = []
  
async function fetchAndUseBooks() {
    try {
        loadingContainer.classList.remove('hidden')
        bookContainer.classList.add('hidden')
        
        displayScelton()

        const booksData = await fetchBooks()

        if(booksData.success){
            allBooks = formatData(booksData.data)
            resultTextDisplay.classList.remove('hidden')
            displayBooks(allBooks)
        }

    } catch (error) {
        loadingContainer.classList.add('hidden')
        bookContainer.classList.add('hidden')
        errorContainer.classList.remove('hidden')

        errorContainer.innerHTML = `
            <h1 id="">Something went Wrong..</h1>
            <h3>Please Retry</h3>
            <button id="retryBtn">Retry</button>`

        const retryBtn = document.getElementById('retryBtn')
        retryBtn.addEventListener('click', fetchAndUseBooks)
        
    } finally {
        loadingContainer.innerHTML = ''
        loadingContainer.classList.add('hidden')
        bookContainer.classList.remove('hidden')
    }

    
}

function displayScelton(count = 10) {
    loadingContainer.innerHTML = ''

    for(let i=0; i<count; i++) {
        loadingContainer.innerHTML += 
        `<div class="loadingDiv">
            <div class="imageLoader"></div>
            <div class="bookLoader"></div>
            <div class="authorLoader"></div>
            <div class="publishLoader"></div>
        </div>`
    }
}

function displayBooks(books) {
    bookContainer.innerHTML = ''

    if(!books || books.length === 0) {
        errorContainer.classList.remove('hidden')
        bookContainer.classList.add('hidden')

        errorContainer.innerHTML = `
            <h1 id="">No Result found ❌</h1>
            <p>🔍 Search for something else...</p>`
        
        return
    }

    errorContainer.classList.add('hidden')
    bookContainer.classList.remove('hidden')

    books.forEach((book, idx) => {
        const bookDiv = document.createElement('div')
        bookDiv.classList.add('bookDiv')

        bookDiv.innerHTML = `
        <a href=${book.infoLink} target="_blank">
            <div class="imgHoverZoom">
                <img id="bookThumbnail" src=${book.thumbnail.thumbnail} alt="book thumbnail">
                 
            </div>
            <div class="bookInfo">
                <p id="bookTitle">${book.title}</p>
                <div class="authorInfo">
                    <p id="authors" class="infoTags">Authors :
                        <span>
                            ${book.authors.join(', ')}
                        </span>
                    </p>
                </div>
                <div class="publishInfo">
                    <p id="publishedDate" class="infoTags">Published Date: <span>${book.publishedDate}</span></p>
                    <p id="publishedBy" class="infoTags">Published By: <span>${book.publisher}</span></p>
                </div>
                <div class="ratings">
                    ${ book.ratings ? '★'.repeat(book.ratings).padEnd(5, '✰') : '' }
                </div> 
            </div>
        </a>`

        bookContainer.appendChild(bookDiv)

    })
}

function formatData(data) {
    const books = []
    const paginationInfo = {
        page: data.page,
        limit: data.limit,
        nextPage: data.nextPage,
        previousPage: data.previousPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
    }

    data.data.forEach(book => {
        const bookObject = {
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors,
            publisher: book.volumeInfo.publisher,
            publishedDate: book.volumeInfo.publishedDate,
            thumbnail: book.volumeInfo.imageLinks,
            infoLink: book.volumeInfo.infoLink,
            ratings: book.volumeInfo.averageRating,
        }

        books.push(bookObject)
    });
    
    return books
}

function searchBooks(query, tag = 'title') {
    if(!query) {
        return null
    }

    let filtredBooks = []; 

    if(tag === 'title') {
        filtredBooks = allBooks.filter(book => book.title.toLowerCase().includes(query.toLowerCase()))
    } else if(tag === 'author') {
        allBooks.forEach(book => {
            book.authors.forEach(author => {
                if (author.toLowerCase().includes(query.toLowerCase())) {
                    filtredBooks.push(book)
                }
            })
        })
    }

    resultTextDisplay.textContent = `Showing ${tag} result for '${query}'`

    displayBooks(filtredBooks)
}

searchButton.addEventListener('click', () => {
    const searchBy = searchByInput.value
    const query = searchInput.value
    searchBooks(query, searchBy)
    searchInput.value = ''
})

fetchAndUseBooks()