const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
        return `
            <img src="${imgSrc}" />
            ${movie.Title} (${movie.Year})
        `;
    },


    inputValue(movie) {
        return movie.Title
    },

    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'ae714273', s: searchTerm
            }
        });

        if (response.data.Error) {
            return [];
        }

        return response.data.Search;
    },

    onOptionSelect(movie) {
        document.querySelector(".tutorial").classList.add("is-hidden")
        onMovieSelect(movie)
    },
}


createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector("#left-autocomplete"),
    onOptionSelect(movie) {
        onMovieSelect(movie, "#left-summary", "left")
    },
})


createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector("#right-autocomplete"),
    onOptionSelect(movie) {
        onMovieSelect(movie, "#right-summary", "right")
    },
})

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, target, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'ae714273', i: movie.imdbID,
        }
    });
    document.querySelector(".tutorial").classList.add("is-hidden")
    document.querySelector(target).innerHTML = movieTemplate(response.data)
    // leftMovie ? rightMovie = response.data : leftMovie = response.data; // my logic :)
    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    if (rightMovie && leftMovie) {
        // run the comparison
        runComparison()
    }
}

const runComparison = () => {
    const leftCollection = document.querySelectorAll("#left-summary .notification")
    const rightCollection = document.querySelectorAll("#right-summary .notification")

    leftCollection.forEach((leftStat, idx) => {
        const rightStat = rightCollection[idx]
        const leftSideValue = leftStat.dataset.value;
        const rightSideValue = rightStat.dataset.value;

        if (rightSideValue > leftSideValue) {
            leftStat.classList.remove('is-primary')
            leftStat.classList.add('is-secondary')
        } else {
            rightStat.classList.remove('is-primary')
            rightStat.classList.add('is-secondary')
        }
    })
}

const movieTemplate = (movieDetails) => {
    const dollars = parseInt(movieDetails.BoxOffice.replace(/\$/g, '').replaceAll(',', ''))
    const metaScore = parseInt(movieDetails.Metascore)
    const imdbRating = parseFloat(movieDetails.imdbRating)
    const imdbVotes = parseFloat(movieDetails.imdbVotes.replaceAll(',', ''))

    const awards = movieDetails.Awards.split(' ').reduce((a, b) => {
        const value = parseInt(b)

        if (value) {
            return a + value
        }

        return a;
    }, 0)

    return `
        <article class="media"> 
            <figure class="media-left">
                <p class="image">
                    <img src=${movieDetails.Poster} alt="Movie Poster"/>
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetails.Title}</h1>
                    <h4>${movieDetails.Genre}</h4>
                    <p>${movieDetails.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetails.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetails.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metaScore} class="notification is-primary">
            <p class="title">${movieDetails.Metascore}</p>
            <p class="subtitle">Meta Score</p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
            <p class="title">${movieDetails.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-primary">
            <p class="title">${movieDetails.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `
}