// function to fetch data from FreeAPI Books endpoint
async function fetchBooks(page = 1) {
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
const paginationDiv = document.querySelector('.paginationDiv')

const searchInput = document.getElementById('searchInput')
const searchByInput = document.getElementById('searchBy')
const searchButton = document.getElementById('searchButton')
const resultTextDisplay = document.getElementById('resultText')

let allBooks = []
  
async function fetchAndUseBooks(page = 1) {
    try {
        loadingContainer.classList.remove('hidden')
        bookContainer.classList.add('hidden')
        
        displaySkeleton()

        const booksData = await fetchBooks(page)

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

        console.log(error)
        
    } finally {
        loadingContainer.innerHTML = ''
        loadingContainer.classList.add('hidden')
        bookContainer.classList.remove('hidden')
    }
}

function displaySkeleton(count = 10) {
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
        <a href=${book?.infoLink} target="_blank">
            <div class="imgHoverZoom">
                <img id="bookThumbnail" src=${book?.thumbnail} alt="book thumbnail">
                 
            </div>
            <div class="bookInfo">
                <p id="bookTitle">${book?.title}</p>
                <div class="authorInfo">
                    <p id="authors" class="infoTags">Authors :
                        <span>
                            ${book?.authors?.join(', ')}
                        </span>
                    </p>
                </div>
                <div class="publishInfo">
                    <p id="publishedDate" class="infoTags">Published Date: <span>${book?.publishedDate}</span></p>
                    <p id="publishedBy" class="infoTags">Published By: <span>${book?.publisher}</span></p>
                </div>
                <div class="ratings">
                    ${ book?.ratings ? '★'.repeat(book.ratings).padEnd(5, '✰') : '' }
                </div> 
            </div>
        </a>`

        bookContainer.appendChild(bookDiv)

    })
}

function updatePagination(paginationInfo) {
    paginationDiv.innerHTML = ''

    if(!paginationInfo){
        return null
    }

    const {page, totalPages, nextPage, previousPage, limit, totalItems} = paginationInfo
    let pageRange;

    if(page <= 3) {
        pageRange = [1, 2, 3, 4, '...', totalPages-2, totalPages-1, totalPages]
    } else if(page >= totalPages - 2) {
        pageRange = [1, 2, 3, '...', totalPages-3, totalPages-2, totalPages-1, totalPages]
    }
    else {
        pageRange = [1, '...', page-1, page, page+1, '...', totalPages]
    } 

    const prevButton = document.createElement('button')
    prevButton.textContent = '≪ Prev'
    prevButton.classList.add('pageBtn')
    prevButton.disabled = !previousPage
    paginationDiv.appendChild(prevButton)
    prevButton.addEventListener('click', () => fetchAndUseBooks(page - 1))

    pageRange.forEach(pageNo => {
        const pageButton = document.createElement('button')
        pageButton.textContent = pageNo
        pageButton.classList.add('pageBtn')
        paginationDiv.appendChild(pageButton)

        if(pageNo === '...'){
            pageButton.disabled = true
        }
        
        if(page === pageNo) {
            pageButton.classList.add('active')
        } else {
            pageButton.classList.remove('active')
        }
        
        pageButton.addEventListener('click', () => fetchAndUseBooks(pageNo))
    })

    const nextButton = document.createElement('button')
    nextButton.textContent = 'Next ≫'
    nextButton.classList.add('pageBtn')
    nextButton.disabled = !nextPage
    paginationDiv.appendChild(nextButton)
    nextButton.addEventListener('click', () => fetchAndUseBooks(page + 1))
}

function formatData(data) {
    const paginationInfo = {
        page: data.page,
        limit: data.limit,
        nextPage: data.nextPage,
        previousPage: data.previousPage,
        totalItems: data.totalItems,
        totalPages: data.totalPages
    }

    const books = data.data.map(book => formatBooksData(book)).filter(book => book !== null)
    
    updatePagination(paginationInfo)

    return books
}

function formatBooksData(bookObj) {
    if(!bookObj.volumeInfo) {
       console.error("Invalid book Object", bookObj)
       return null
    }

    const bookInfo = bookObj.volumeInfo

    if(!bookInfo.title ||
        !bookInfo.authors ||
        !bookInfo.publisher ||
        !bookInfo.publishedDate ||
        !bookInfo.imageLinks ||
        !bookInfo.infoLink
    ) {
        console.error("Invalid book Object structure", bookObj)
        return null
    }

    return {
        title: bookInfo.title,
        authors: bookInfo.authors,
        publisher: bookInfo.publisher,
        publishedDate: bookInfo.publishedDate,
        thumbnail: bookInfo.imageLinks?.thumbnail ||  bookInfo.imageLinks?.smallThumbnail ,
        infoLink: bookInfo.infoLink,
        ratings: bookInfo?.averageRating,
    }
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