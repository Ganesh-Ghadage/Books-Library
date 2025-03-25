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
const sortByInput = document.getElementById('sortBy')
const gridLayoutButton = document.getElementById('gridLayout')
const listLayoutButton = document.getElementById('listLayout')

// initlize global variable for books
let allBooks = []
  
// function to fetch and use the books data
async function fetchAndUseBooks(page = 1) {
    try {
        // show loading skeleton while books data is loading
        loadingContainer.classList.remove('hidden')
        bookContainer.classList.add('hidden')
        paginationDiv.classList.add('hidden')
        
        displaySkeleton()

        // fetch books data using fetch function
        const booksData = await fetchBooks(page)

        // if we get data display it on screen
        if(booksData.success){
            // hide the errors
            errorContainer.classList.add('hidden')
            errorContainer.innerHTML = ''

            // format the data in required format
            allBooks = formatData(booksData.data)

            // display the result and pagination
            resultTextDisplay.classList.remove('hidden')
            paginationDiv.classList.remove('hidden')

            //display books
            displayBooks(allBooks)
        }

    } catch (error) {
        // handle error if any
        loadingContainer.classList.add('hidden')
        bookContainer.classList.add('hidden')
        paginationDiv.classList.add('hidden')
        errorContainer.classList.remove('hidden')

        bookContainer.innerHTML = ''
        
        errorContainer.innerHTML = `
            <h1 id="">Something went Wrong..</h1>
            <h3>Please Retry</h3>
            <button id="retryBtn">Retry</button>`

        // retry button if we get any error
        const retryBtn = document.getElementById('retryBtn')
        retryBtn.addEventListener('click', fetchAndUseBooks)

        console.log(error)
        
    } finally {
        // once we get result remove loading skeleton
        loadingContainer.innerHTML = ''
        loadingContainer.classList.add('hidden')
        bookContainer.classList.remove('hidden')
        paginationDiv.classList.remove('hidden')
    }
}

// function to display loading skeleton
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

// function to display books
function displayBooks(books) {
    bookContainer.innerHTML = ''

    // check if have books data or not, if not display error message
    if(!books || books.length === 0) {
        errorContainer.classList.remove('hidden')
        bookContainer.classList.add('hidden')
        paginationDiv.classList.add('hidden')

        errorContainer.innerHTML = `
            <h1 id="">No Result found ❌</h1>
            <p>🔍 Search for something else...</p>
            <button id="loadAll">Load ALL Books</button>`

        resultTextDisplay.textContent = ``

        const loadAll = document.getElementById('loadAll')
        loadAll.addEventListener('click', () => displayBooks(allBooks))

        resultTextDisplay.textContent = `Showing Trendig results`
        return
    }

    errorContainer.classList.add('hidden')
    bookContainer.classList.remove('hidden')
    paginationDiv.classList.remove('hidden')

    // display each book object on screen
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

// function to display pagination buttons
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

    // previous page button
    const prevButton = document.createElement('button')
    prevButton.textContent = '≪ Prev'
    prevButton.classList.add('pageBtn')
    prevButton.disabled = !previousPage
    paginationDiv.appendChild(prevButton)
    prevButton.addEventListener('click', () => fetchAndUseBooks(page - 1))

    // all pages buttons
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

    // next page button
    const nextButton = document.createElement('button')
    nextButton.textContent = 'Next ≫'
    nextButton.classList.add('pageBtn')
    nextButton.disabled = !nextPage
    paginationDiv.appendChild(nextButton)
    nextButton.addEventListener('click', () => fetchAndUseBooks(page + 1))
}

// function to format the data in required format
function formatData(data) {
    // get pagination information
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

// function to process each books data
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

// function to implement search
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
    searchButton.innerText = '❌'

    displayBooks(filtredBooks)
}

// function to sort books data
function sortBooks(options) {
    if(!options) {
        displayBooks(allBooks)
        return null
    }

    const[sortBy, order] = options.split('-')

    let sortedBooks = [...allBooks]

    sortedBooks.sort(function (bookA, bookB) {
        // accending sort
        if(order === 'ace') {
            if (bookA[sortBy] < bookB[sortBy]) {
                return -1;
            }
            if (bookA[sortBy] > bookB[sortBy]) {
                return 1;
            }
            return 0;
        } 
        // decending sort
        else if (order === 'dec') {
            if (bookA[sortBy] > bookB[sortBy]) {
                return -1;
            }
            if (bookA[sortBy] < bookB[sortBy]) {
                return 1;
            }
            return 0;
        }
        
    });

    displayBooks(sortedBooks)
}

// search button event listener
searchButton.addEventListener('click', () => {
    // if search button has ❌ remove search filter / clear search
    if(searchButton.innerText === '❌') {
        displayBooks(allBooks)
        searchInput.value = ''
        searchButton.innerText = '🔍'
        resultTextDisplay.textContent = `Showing Trendig results`
    } else {
        // else filter the books as per search query
        const searchBy = searchByInput.value
        const query = searchInput.value
        searchBooks(query, searchBy)
    }
    
})

// sort event listener
sortByInput.addEventListener('input', (e) => {
    const sortBy = e.target.value
    sortBooks(sortBy)
})

// event listener to change layout to grid
gridLayoutButton.addEventListener('click', () => {
    bookContainer.classList.add('grid')
    bookContainer.classList.remove('list')
    gridLayoutButton.classList.add('active')
    listLayoutButton.classList.remove('active')
})

// event listener to change layout to list
listLayoutButton.addEventListener('click', () => {
    bookContainer.classList.remove('grid')
    bookContainer.classList.add('list')
    gridLayoutButton.classList.remove('active')
    listLayoutButton.classList.add('active')
})

// to display the books when page is loaded initially
fetchAndUseBooks()